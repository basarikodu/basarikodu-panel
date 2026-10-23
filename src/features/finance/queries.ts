import "server-only";
import { istanbulToUtc } from "@/features/lessons/rules";
import { createClient } from "@/lib/supabase/server";
import { incomeExpense, shiftPeriod, studentBalances, tutorDues, type Period } from "./rules";

async function periodData(p: Period) {
  const supabase = await createClient();
  const [{ data: payments }, { data: lessons }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, student_id, amount, paid_at, method, note, student:students(profile:profiles!inner(full_name))",
      )
      .gte("paid_at", p.start)
      .lt("paid_at", p.end)
      .order("paid_at", { ascending: false }),
    supabase
      .from("lessons")
      .select("id, tutor_id, tutor_rate_snapshot, payout_id, is_free, starts_at, subject_id")
      .eq("status", "completed")
      .gte("starts_at", istanbulToUtc(p.start).toISOString())
      .lt("starts_at", istanbulToUtc(p.end).toISOString()),
  ]);
  return { payments: payments ?? [], lessons: lessons ?? [] };
}

/** Gelir-gider özeti + önceki dönemle karşılaştırma */
export async function getFinanceSummary(p: Period) {
  const [cur, prev] = await Promise.all([periodData(p), periodData(shiftPeriod(p, -1))]);
  return {
    current: { ...incomeExpense(cur.payments, cur.lessons), lessonCount: cur.lessons.length },
    previous: { ...incomeExpense(prev.payments, prev.lessons), lessonCount: prev.lessons.length },
    payments: cur.payments.map((x) => ({
      id: x.id,
      studentId: x.student_id,
      studentName: x.student?.profile.full_name ?? "",
      amount: Number(x.amount),
      paidAt: x.paid_at,
      method: x.method,
      note: x.note,
    })),
  };
}

/** Eğitmen ödenecekleri: dönemdeki tamamlanan dersler, ödenen / bekleyen */
export async function getTutorPayables(p: Period) {
  const supabase = await createClient();
  const [{ lessons }, { data: tutors }, { data: payouts }] = await Promise.all([
    periodData(p),
    supabase
      .from("tutors")
      .select("id, iban, payout_frequency, profile:profiles!inner(full_name, is_active)"),
    supabase
      .from("tutor_payouts")
      .select("id, tutor_id, period_start, period_end, lesson_count, amount, paid_at, note")
      .lt("period_start", p.end)
      .gt("period_end", p.start)
      .order("paid_at", { ascending: false }),
  ]);

  const tutorMap = new Map((tutors ?? []).map((t) => [t.id, t]));
  return tutorDues(lessons)
    .map((d) => {
      const t = tutorMap.get(d.tutorId);
      return {
        ...d,
        fullName: t?.profile.full_name ?? "Eğitmen",
        iban: t?.iban ?? null,
        payoutFrequency: t?.payout_frequency ?? "monthly",
        payouts: (payouts ?? [])
          .filter((x) => x.tutor_id === d.tutorId)
          .map((x) => ({ ...x, amount: Number(x.amount) })),
      };
    })
    .sort((a, b) => b.dueTotal - a.dueTotal || a.fullName.localeCompare(b.fullName, "tr"));
}

/** Bekleyen tahsilatlar (tüm zamanlar): paket toplamı – ödemeler */
export async function getOutstandingBalances() {
  const supabase = await createClient();
  const [{ data: packages }, { data: payments }, { data: students }] = await Promise.all([
    supabase.from("student_packages").select("student_id, price_total"),
    supabase.from("payments").select("student_id, amount"),
    supabase.from("students").select("id, profile:profiles!inner(full_name, is_active, phone)"),
  ]);
  const names = new Map((students ?? []).map((s) => [s.id, s.profile]));
  return studentBalances(packages ?? [], payments ?? [])
    .filter((b) => b.outstanding > 0)
    .map((b) => ({
      ...b,
      fullName: names.get(b.studentId)?.full_name ?? "",
      phone: names.get(b.studentId)?.phone ?? null,
    }))
    .sort((a, b) => b.outstanding - a.outstanding);
}

/** Tahsilat formu için öğrenci listesi */
export async function getStudentOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, profile:profiles!inner(full_name, is_active)")
    .eq("profile.is_active", true);
  return (data ?? [])
    .map((s) => ({ value: s.id, label: s.profile.full_name }))
    .sort((a, b) => a.label.localeCompare(b.label, "tr"));
}
