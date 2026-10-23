// Ders planlama için saf kurallar ve İstanbul saatiyle tarih yardımcıları.
// Türkiye sabit UTC+3 (yaz saati yok).

const OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" (İstanbul takvim günü) */
export type DateKey = string;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const isDateKey = (v: unknown): v is DateKey =>
  typeof v === "string" && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
export const isTimeValue = (v: unknown): v is string => typeof v === "string" && TIME_RE.test(v);

/** Anın İstanbul takvim günü */
export function toDateKey(d: Date): DateKey {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

/** İstanbul günü + "HH:MM" → UTC anı */
export function istanbulToUtc(date: DateKey, time = "00:00"): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - OFFSET_MS);
}

export function addDays(date: DateKey, days: number): DateKey {
  return toDateKey(new Date(istanbulToUtc(date).getTime() + days * DAY_MS));
}

/** Verilen günün haftasının Pazartesisi */
export function weekStartOf(date: DateKey): DateKey {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Pazar
  return addDays(date, -((dow + 6) % 7));
}

/** Anın İstanbul saatiyle "HH:MM" değeri */
export function toTimeValue(d: Date): string {
  return new Date(d.getTime() + OFFSET_MS).toISOString().slice(11, 16);
}

export type Occurrence = { starts_at: string; ends_at: string };

/** Haftalık tekrar eden ders oturumları (weeks = 1 → tek ders) */
export function buildOccurrences(
  date: DateKey,
  time: string,
  durationMin: number,
  weeks: number,
): Occurrence[] {
  const first = istanbulToUtc(date, time).getTime();
  return Array.from({ length: weeks }, (_, i) => {
    const start = first + i * 7 * DAY_MS;
    return {
      starts_at: new Date(start).toISOString(),
      ends_at: new Date(start + durationMin * 60_000).toISOString(),
    };
  });
}

type Range = { starts_at: string; ends_at: string };

export function overlaps(a: Range, b: Range): boolean {
  return (
    Date.parse(a.starts_at) < Date.parse(b.ends_at) &&
    Date.parse(b.starts_at) < Date.parse(a.ends_at)
  );
}

/** Planlanacak oturumlardan mevcut derslerle çakışanlar */
export function findConflicts<T extends Range>(planned: Occurrence[], existing: T[]) {
  return planned.filter((p) => existing.some((e) => overlaps(p, e)));
}

type LessonState = {
  status: string;
  approval_status: string;
  starts_at: string;
};

/** Eğitmen sonuç (tamamlandı / gelmedi) girebilir mi? */
export function canRecordResult(l: LessonState, now: Date = new Date()): boolean {
  return (
    l.approval_status === "approved" &&
    ["planned", "completed", "no_show"].includes(l.status) &&
    Date.parse(l.starts_at) <= now.getTime()
  );
}

/** Eğitmen erteleme / iptal talebi gönderebilir mi? */
export function canRequestChange(l: LessonState & { hasPendingChange?: boolean }): boolean {
  return l.approval_status === "approved" && l.status === "planned" && !l.hasPendingChange;
}

/** Eğitmen dersi geri çekebilir mi? (henüz onaylanmamış / reddedilmiş) */
export function canWithdraw(l: LessonState): boolean {
  return l.approval_status === "pending" || l.approval_status === "rejected";
}
