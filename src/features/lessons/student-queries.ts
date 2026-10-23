import "server-only";
import { getCreditBalances } from "@/features/users/queries";
import { toMonthKey, type MonthKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getWeekLessons, toCalendarLesson, type LessonRow } from "./queries";
import type { DateKey } from "./rules";
import type { CalendarLesson } from "./types";

const STUDENT_LESSON_FIELDS =
  "id, series_id, tutor_id, starts_at, ends_at, status, approval_status, rejection_reason, lesson_type, topic, meeting_url, is_free, subject:subjects(name, color), student:students(id, profile:profiles!inner(full_name)), tutor:tutors(id, profile:profiles!inner(full_name)), lesson_change_requests(id, request_type, new_starts_at, new_ends_at, cancel_status, reason, status, review_note, created_at)";

/**
 * Öğrenci eğitmen tablosunu (IBAN) göremez; eğitmen adlarını profillerden doldurur.
 * RLS: öğrenci, ders yaptığı eğitmenlerin profil adını görebilir.
 */
async function withTutorNames(lessons: CalendarLesson[]) {
  const missing = [...new Set(lessons.filter((l) => !l.tutorName).map((l) => l.tutorId))];
  if (missing.length === 0) return lessons;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("id, full_name").in("id", missing);
  const names = new Map((data ?? []).map((p) => [p.id, p.full_name]));
  return lessons.map((l) =>
    l.tutorName ? l : { ...l, tutorName: names.get(l.tutorId) ?? "Eğitmen" },
  );
}

export async function getStudentWeek(studentId: string, weekStart: DateKey) {
  return withTutorNames(await getWeekLessons(weekStart, { studentId }));
}

/** Ana ekran: sıradaki ders, ders hakkı, sayılar */
export async function getStudentOverview(studentId: string, now = new Date()) {
  const supabase = await createClient();
  const month = toMonthKey(now);
  const [{ data: upcoming }, { data: completed }, { data: tutors }, credits] = await Promise.all([
    supabase
      .from("lessons")
      .select(STUDENT_LESSON_FIELDS)
      .eq("student_id", studentId)
      .eq("approval_status", "approved")
      .eq("status", "planned")
      .gt("ends_at", now.toISOString())
      .order("starts_at")
      .limit(1),
    supabase
      .from("lessons")
      .select("starts_at")
      .eq("student_id", studentId)
      .eq("status", "completed"),
    supabase
      .from("tutor_students")
      .select("tutor_id")
      .eq("student_id", studentId)
      .eq("is_active", true),
    getCreditBalances(month),
  ]);

  const next = upcoming?.[0]
    ? (await withTutorNames([toCalendarLesson(upcoming[0] as unknown as LessonRow)]))[0]
    : null;
  const all = completed ?? [];
  return {
    next,
    credit: credits.get(studentId) ?? null,
    month,
    totalCompleted: all.length,
    monthCompleted: all.filter((l) => toMonthKey(new Date(l.starts_at)) === month).length,
    tutorCount: new Set((tutors ?? []).map((t) => t.tutor_id)).size,
  };
}

export type MonthSummary = {
  month: MonthKey;
  packageLessons: number | null;
  completed: number;
  noShow: number;
  bySubject: { name: string; color: string; count: number }[];
};

/** Ders geçmişi: tüm dersler ve ay ay özet (paket, yapılan, hangi dersler) */
export async function getStudentHistory(studentId: string) {
  const supabase = await createClient();
  const [{ data: rows }, { data: packages }] = await Promise.all([
    supabase
      .from("lessons")
      .select(STUDENT_LESSON_FIELDS)
      .eq("student_id", studentId)
      .order("starts_at", { ascending: false }),
    supabase.from("student_packages").select("month, lesson_count").eq("student_id", studentId),
  ]);

  const lessons = await withTutorNames(
    ((rows ?? []) as unknown as LessonRow[]).map(toCalendarLesson),
  );
  const pkg = new Map((packages ?? []).map((p) => [p.month, p.lesson_count]));
  const months = new Map<MonthKey, MonthSummary>();

  const ensure = (m: MonthKey) => {
    if (!months.has(m)) {
      months.set(m, {
        month: m,
        packageLessons: pkg.get(m) ?? null,
        completed: 0,
        noShow: 0,
        bySubject: [],
      });
    }
    return months.get(m)!;
  };
  for (const m of pkg.keys()) ensure(m as MonthKey);

  for (const l of lessons) {
    const s = ensure(toMonthKey(new Date(l.startsAt)));
    if (l.status === "no_show") s.noShow += 1;
    if (l.status !== "completed") continue;
    s.completed += 1;
    const subj = s.bySubject.find((b) => b.name === l.subjectName);
    if (subj) subj.count += 1;
    else s.bySubject.push({ name: l.subjectName, color: l.color, count: 1 });
  }

  const now = Date.now();
  return {
    lessons,
    upcoming: lessons.filter((l) => Date.parse(l.endsAt) > now && l.status === "planned").reverse(),
    past: lessons.filter((l) => !(Date.parse(l.endsAt) > now && l.status === "planned")),
    months: [...months.values()].sort((a, b) => b.month.localeCompare(a.month)),
  };
}
