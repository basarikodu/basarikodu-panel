"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbFail, fail, formValue, ok, zodFail, type ActionState } from "@/lib/action-state";
import { requireRole } from "@/lib/auth";
import { formatMonthKey, isMonthKey, shiftMonthKey, type MonthKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { packagesToCopy } from "./rules";

const packageSchema = z.object({
  month: z.string().refine(isMonthKey, "Ay seçin"),
  lesson_count: z.coerce.number().int().min(1, "Ders sayısı en az 1 olmalı").max(60),
  price_total: z.coerce.number().min(0, "Tutar negatif olamaz").max(1_000_000),
  note: z.string().max(200).nullable(),
});

export async function savePackage(
  studentId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await requireRole("founder");
  const preset = formValue(fd, "preset");
  const parsed = packageSchema.safeParse({
    month: formValue(fd, "month"),
    lesson_count: preset && preset !== "custom" ? preset : formValue(fd, "lesson_count"),
    price_total: formValue(fd, "price_total") ?? 0,
    note: formValue(fd, "note"),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_packages")
    .upsert(
      { student_id: studentId, ...parsed.data, created_by: me.id },
      { onConflict: "student_id,month" },
    );
  if (error) return dbFail(error);

  revalidatePath(`/kurucu/ogrenciler/${studentId}`);
  revalidatePath("/kurucu/ogrenciler");
  return ok(`${formatMonthKey(parsed.data.month as MonthKey)} paketi kaydedildi`);
}

export async function deletePackage(id: string, studentId: string): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { error } = await supabase.from("student_packages").delete().eq("id", id);
  if (error) return dbFail(error);
  revalidatePath(`/kurucu/ogrenciler/${studentId}`);
  revalidatePath("/kurucu/ogrenciler");
  return ok("Paket silindi");
}

/** Seçilen ay için, önceki ayın paketlerini (paketi olmayan aktif öğrencilere) kopyalar. */
export async function copyPackagesFromPreviousMonth(
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await requireRole("founder");
  const month = formValue(fd, "month");
  if (!isMonthKey(month)) return fail("Ay seçin");
  const prevMonth = shiftMonthKey(month, -1);

  const supabase = await createClient();
  const [{ data: previous }, { data: existing }, { data: active }] = await Promise.all([
    supabase
      .from("student_packages")
      .select("student_id, lesson_count, price_total, note")
      .eq("month", prevMonth),
    supabase.from("student_packages").select("student_id").eq("month", month),
    supabase.from("profiles").select("id").eq("role", "student").eq("is_active", true),
  ]);

  const rows = packagesToCopy(
    previous ?? [],
    (existing ?? []).map((r) => r.student_id),
    (active ?? []).map((r) => r.id),
  );
  if (rows.length === 0) {
    return fail(
      `${formatMonthKey(prevMonth)} ayında kopyalanacak paket yok veya tüm öğrencilerin ${formatMonthKey(month)} paketi zaten var`,
    );
  }

  const { error } = await supabase
    .from("student_packages")
    .insert(rows.map((r) => ({ ...r, month, created_by: me.id })));
  if (error) return dbFail(error);

  revalidatePath("/kurucu/ogrenciler", "layout");
  return ok(`${rows.length} öğrencinin ${formatMonthKey(month)} paketi oluşturuldu`);
}
