import type { PostgrestError } from "@supabase/supabase-js";
import type { ZodError } from "zod";

/** Server Action'ların useActionState ile döndürdüğü ortak sonuç. */
export type ActionState =
  | {
      error?: string;
      success?: string;
      /** Yeni hesap oluşturulduğunda bir kez gösterilen geçici şifre */
      tempPassword?: string;
      /** Geçici şifrenin ait olduğu giriş e-postası */
      email?: string;
      /** Formun her başarılı gönderimde değişen anahtarı (dialog kapatma vb.) */
      ts?: number;
    }
  | undefined;

export const ok = (success: string, extra?: Partial<NonNullable<ActionState>>): ActionState => ({
  success,
  ts: Date.now(),
  ...extra,
});

export const fail = (error: string): ActionState => ({ error, ts: Date.now() });

export const zodFail = (err: ZodError): ActionState =>
  fail(err.issues[0]?.message ?? "Geçersiz bilgi");

/** Veritabanı hatalarını kullanıcıya anlaşılır Türkçe mesaja çevirir. */
export function dbFail(
  err: PostgrestError | { message: string; code?: string } | null,
): ActionState {
  if (!err) return fail("Beklenmeyen bir hata oluştu");
  switch (err.code) {
    case "23505":
      return fail("Bu kayıt zaten var");
    case "23P01":
      return fail("Bu saatte eğitmenin veya öğrencinin başka bir dersi var");
    case "23503":
      return fail("Bağlı kayıtlar olduğu için bu işlem yapılamaz");
    case "42501":
      return fail("Bu işlem için yetkiniz yok");
    case "P0001":
      return fail(err.message); // trigger'ların Türkçe mesajları
    default:
      return fail("İşlem kaydedilemedi. Lütfen tekrar deneyin.");
  }
}

/** FormData'dan boş string'leri null'a çeviren okuyucu. */
export function formValue(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}
