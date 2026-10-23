// Arayüzdeki tüm para, tarih ve saat gösterimleri buradan geçer.
// DB'de zamanlar UTC (timestamptz); arayüzde Europe/Istanbul.

export const TIME_ZONE = "Europe/Istanbul";
const LOCALE = "tr-TR";
// Türkiye 2016'dan beri sabit UTC+3 (yaz saati yok).
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1234.5 → "1.234,50 ₺" */
export function formatMoney(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return `${moneyFormatter.format(Number.isFinite(n) ? n : 0)} ₺`;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: "long",
});
const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  month: "long",
  year: "numeric",
});

const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d);

/** "23 Eki 2026" */
export const formatDate = (d: Date | string) => dateFormatter.format(toDate(d));
/** "19:00" */
export const formatTime = (d: Date | string) => timeFormatter.format(toDate(d));
/** "Cuma" */
export const formatWeekday = (d: Date | string) => weekdayFormatter.format(toDate(d));
/** "Ekim 2026" */
export const formatMonth = (d: Date | string) => monthFormatter.format(toDate(d));
/** "23 Eki 2026 · 19:00" */
export const formatDateTime = (d: Date | string) => `${formatDate(d)} · ${formatTime(d)}`;

export type PeriodKind = "week" | "month";

/**
 * İstanbul saatine göre haftanın (Pazartesi 00:00) veya ayın başlangıcı ve
 * bir sonraki dönemin başlangıcı (hariç). Dönen değerler UTC anlarıdır.
 */
export function getPeriodRange(kind: PeriodKind, ref: Date = new Date()) {
  const local = new Date(ref.getTime() + ISTANBUL_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const day = local.getUTCDate();

  let startLocal: number;
  let endLocal: number;
  if (kind === "month") {
    startLocal = Date.UTC(y, m, 1);
    endLocal = Date.UTC(y, m + 1, 1);
  } else {
    const mondayOffset = (local.getUTCDay() + 6) % 7; // Pazartesi = 0
    startLocal = Date.UTC(y, m, day - mondayOffset);
    endLocal = Date.UTC(y, m, day - mondayOffset + 7);
  }
  return {
    start: new Date(startLocal - ISTANBUL_OFFSET_MS),
    end: new Date(endLocal - ISTANBUL_OFFSET_MS),
  };
}

/** Bir önceki / sonraki dönem için referans tarih. */
export function shiftPeriod(kind: PeriodKind, ref: Date, step: number): Date {
  const { start } = getPeriodRange(kind, ref);
  const local = new Date(start.getTime() + ISTANBUL_OFFSET_MS);
  if (kind === "week") local.setUTCDate(local.getUTCDate() + 7 * step);
  else local.setUTCMonth(local.getUTCMonth() + step);
  return new Date(local.getTime() - ISTANBUL_OFFSET_MS);
}
