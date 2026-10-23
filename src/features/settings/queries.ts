import "server-only";
import type { LessonPrices } from "@/features/packages/rules";
import { createClient } from "@/lib/supabase/server";

/** Öğrenci ders fiyatları (Ayarlar'dan kurucu yönetir) */
export async function getLessonPrices(): Promise<LessonPrices> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("lesson_price_single, lesson_price_multi")
    .eq("id", 1)
    .maybeSingle();
  return {
    single: Number(data?.lesson_price_single ?? 950),
    multi: Number(data?.lesson_price_multi ?? 850),
  };
}
