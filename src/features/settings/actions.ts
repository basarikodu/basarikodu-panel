"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbFail, fail, formValue, ok, zodFail, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  tutor_rate_private: z.coerce.number().min(0, "Ücret negatif olamaz").max(100_000),
  tutor_rate_coaching: z.coerce.number().min(0, "Ücret negatif olamaz").max(100_000),
  duration_private: z.coerce.number().int().min(15).max(240),
  duration_coaching: z.coerce.number().int().min(15).max(240),
});

export async function updateSettings(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireRole("founder");
  const parsed = settingsSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ ...parsed.data, updated_by: me.id })
    .eq("id", 1);
  if (error) return dbFail(error);

  revalidatePath("/kurucu/ayarlar");
  return ok("Ayarlar kaydedildi. Yeni ücret bundan sonra tamamlanan derslere uygulanır.");
}

const subjectSchema = z.object({
  name: z.string().min(2, "Branş adı en az 2 karakter olmalı").max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Renk seçin"),
  is_active: z.boolean(),
});

function readSubject(fd: FormData) {
  return subjectSchema.safeParse({
    name: formValue(fd, "name"),
    color: formValue(fd, "color") ?? "#1b2e6e",
    is_active: fd.get("is_active") !== "off",
  });
}

export async function createSubject(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readSubject(fd);
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { data: last } = await supabase
    .from("subjects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error } = await supabase
    .from("subjects")
    .insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 10 });
  if (error) return error.code === "23505" ? fail("Bu isimde bir branş zaten var") : dbFail(error);

  revalidatePath("/kurucu", "layout");
  return ok("Branş eklendi");
}

export async function updateSubject(
  id: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const parsed = readSubject(fd);
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").update(parsed.data).eq("id", id);
  if (error) return error.code === "23505" ? fail("Bu isimde bir branş zaten var") : dbFail(error);

  revalidatePath("/kurucu", "layout");
  return ok("Branş güncellendi");
}
