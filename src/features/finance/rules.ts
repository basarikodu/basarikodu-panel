// Gelir-gider ve eğitmen ödemeleri için saf hesaplar.
import { addDays, weekStartOf, type DateKey } from "@/features/lessons/rules";

export type PeriodKind = "hafta" | "ay";

export type Period = {
  kind: PeriodKind;
  /** Dahil, İstanbul günü */
  start: DateKey;
  /** Hariç, İstanbul günü */
  end: DateKey;
};

/** Referans günün haftası (Pzt–Pzt) veya ayı (1'i–sonraki ayın 1'i) */
export function periodOf(kind: PeriodKind, ref: DateKey): Period {
  if (kind === "hafta") {
    const start = weekStartOf(ref);
    return { kind, start, end: addDays(start, 7) };
  }
  const [y, m] = ref.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { kind, start, end: next };
}

export function shiftPeriod(p: Period, step: number): Period {
  if (p.kind === "hafta") return periodOf("hafta", addDays(p.start, 7 * step));
  const [y, m] = p.start.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + step, 1));
  return periodOf("ay", d.toISOString().slice(0, 10));
}

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

export function periodLabel(p: Period): string {
  const [y, m, d] = p.start.split("-").map(Number);
  if (p.kind === "ay") return `${MONTHS[m - 1]} ${y}`;
  const last = addDays(p.end, -1);
  const [y2, m2, d2] = last.split("-").map(Number);
  const left = m === m2 ? `${d}` : `${d} ${MONTHS[m - 1]}`;
  return `${left} – ${d2} ${MONTHS[m2 - 1]} ${y2}`;
}

type CompletedLesson = {
  tutor_id: string;
  tutor_rate_snapshot: number;
  payout_id: string | null;
  is_free: boolean;
};

export type TutorDue = {
  tutorId: string;
  lessonCount: number;
  freeCount: number;
  total: number;
  paidTotal: number;
  dueTotal: number;
  dueCount: number;
};

/** Eğitmen başına dönem hakedişi: toplam, ödenen ve bekleyen (ders bazında) */
export function tutorDues(lessons: CompletedLesson[]): TutorDue[] {
  const map = new Map<string, TutorDue>();
  for (const l of lessons) {
    const d =
      map.get(l.tutor_id) ??
      ({
        tutorId: l.tutor_id,
        lessonCount: 0,
        freeCount: 0,
        total: 0,
        paidTotal: 0,
        dueTotal: 0,
        dueCount: 0,
      } as TutorDue);
    const amount = Number(l.tutor_rate_snapshot) || 0;
    d.lessonCount += 1;
    if (l.is_free) d.freeCount += 1;
    d.total += amount;
    if (l.payout_id) d.paidTotal += amount;
    else {
      d.dueTotal += amount;
      d.dueCount += 1;
    }
    map.set(l.tutor_id, d);
  }
  return [...map.values()].map((d) => ({
    ...d,
    total: round2(d.total),
    paidTotal: round2(d.paidTotal),
    dueTotal: round2(d.dueTotal),
  }));
}

/** Gelir (tahsilat) – gider (eğitmen hakedişi) = net */
export function incomeExpense(
  payments: { amount: number }[],
  lessons: { tutor_rate_snapshot: number }[],
) {
  const income = round2(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
  const expense = round2(lessons.reduce((s, l) => s + (Number(l.tutor_rate_snapshot) || 0), 0));
  return { income, expense, net: round2(income - expense) };
}

/** Öğrenci bakiyesi: paket tutarları – ödemeler (pozitif = bekleyen tahsilat) */
export function studentBalances(
  packages: { student_id: string; price_total: number }[],
  payments: { student_id: string; amount: number }[],
) {
  const map = new Map<string, { billed: number; paid: number }>();
  for (const p of packages) {
    const b = map.get(p.student_id) ?? { billed: 0, paid: 0 };
    b.billed += Number(p.price_total) || 0;
    map.set(p.student_id, b);
  }
  for (const p of payments) {
    const b = map.get(p.student_id) ?? { billed: 0, paid: 0 };
    b.paid += Number(p.amount) || 0;
    map.set(p.student_id, b);
  }
  return [...map.entries()].map(([studentId, b]) => ({
    studentId,
    billed: round2(b.billed),
    paid: round2(b.paid),
    outstanding: round2(b.billed - b.paid),
  }));
}

/** Önceki döneme göre değişim yüzdesi (önceki 0 ise null) */
export function changePct(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

const round2 = (n: number) => Math.round(n * 100) / 100;
