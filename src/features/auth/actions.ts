"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ROLE_HOME } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import type { ActionState } from "@/lib/action-state";

export type FormState = ActionState;

const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifrenizi girin"),
  gate: z.enum(["student", "tutor", "founder"]),
});

const WRONG_GATE = {
  student: "Bu giriş öğrenci ve veliler içindir. Eğitmenseniz Eğitmen Girişi'ni kullanın.",
  tutor: "Bu giriş eğitmenler içindir. Öğrenci veya veliyseniz Öğrenci / Veli Girişi'ni kullanın.",
  founder: "Bu giriş yalnızca kurucular içindir.",
} as const;

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { email, password, gate } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "E-posta veya şifre hatalı" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile || !profile.is_active) {
    await supabase.auth.signOut();
    return { error: "Hesabınız aktif değil. Lütfen BaşarıKodu ile iletişime geçin." };
  }
  // Her giriş kapısı yalnızca kendi rolüne açık
  if (profile.role !== gate) {
    await supabase.auth.signOut();
    return { error: WRONG_GATE[gate] };
  }

  redirect(ROLE_HOME[profile.role]);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

const resetSchema = z.object({ email: z.email("Geçerli bir e-posta adresi girin") });

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/sifre-belirle`,
  });
  // Hesabın var olup olmadığını belli etmemek için her durumda aynı mesaj
  return { success: "Hesap varsa şifre yenileme bağlantısı e-postanıza gönderildi." };
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Şifreler eşleşmiyor" });

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir; yeniden deneyin." };
  }
  return { success: "Şifreniz kaydedildi." };
}
