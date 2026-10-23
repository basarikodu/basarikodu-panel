// Ders hakkı gösterimi için saf yardımcılar (get_credit_balances satırı üzerinde).

export type CreditRow = {
  total_credits: number;
  used_credits: number;
  remaining: number;
  month_package: number;
  month_completed: number;
  carried_over: number;
};

export type CreditTone = "none" | "ok" | "low" | "out";

/** Kalan hakka göre renk tonu: yok / yeterli / azaldı (≤2) / bitti (≤0) */
export function creditTone(row: CreditRow | null | undefined): CreditTone {
  if (!row || row.total_credits === 0) return "none";
  if (row.remaining <= 0) return "out";
  if (row.remaining <= 2) return "low";
  return "ok";
}

/** Bu ayki ilerleme çubuğu: bu ay kullanılabilir hak = devreden + bu ayın paketi */
export function monthProgress(row: CreditRow) {
  const available = Math.max(row.carried_over, 0) + row.month_package;
  const pct =
    available > 0 ? Math.min(100, Math.round((row.month_completed / available) * 100)) : 0;
  return { available, pct };
}

type PackageLike = {
  student_id: string;
  lesson_count: number;
  price_total: number;
  note: string | null;
};

/**
 * Önceki ayın paketlerinden yeni ay için kopyalanacak satırlar.
 * Yeni ayda zaten paketi olan ve pasif öğrenciler atlanır.
 */
export function packagesToCopy<T extends PackageLike>(
  previous: T[],
  existingStudentIds: Iterable<string>,
  activeStudentIds: Iterable<string>,
) {
  const existing = new Set(existingStudentIds);
  const active = new Set(activeStudentIds);
  return previous
    .filter((p) => active.has(p.student_id) && !existing.has(p.student_id))
    .map((p) => ({
      student_id: p.student_id,
      lesson_count: p.lesson_count,
      price_total: p.price_total,
      note: p.note,
    }));
}

export type LessonPrices = { single: number; multi: number };

/**
 * Önerilen paket tutarı: aylık 8+ ders (haftada 2 ve üzeri) indirimli ders fiyatından,
 * daha azı tek ders fiyatından hesaplanır. Kurucu formda tutarı değiştirebilir.
 */
export function suggestedPackagePrice(lessonCount: number, prices: LessonPrices, threshold = 8) {
  if (!Number.isFinite(lessonCount) || lessonCount <= 0) return 0;
  const unit = lessonCount >= threshold ? prices.multi : prices.single;
  return Math.round(lessonCount * unit * 100) / 100;
}
