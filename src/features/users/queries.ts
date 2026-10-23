import "server-only";
import { getPeriodRange, toMonthKey, type MonthKey } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function getSubjects({ activeOnly = true } = {}) {
  const supabase = await createClient();
  let q = supabase
    .from("subjects")
    .select("id, name, color, is_active, sort_order")
    .order("sort_order");
  if (activeOnly) q = q.eq("is_active", true);
  const { data } = await q;
  return data ?? [];
}

/** Bu ay tamamlanan ders sayıları (eğitmen ve öğrenci bazında). */
async function completedThisMonth() {
  const supabase = await createClient();
  const { start, end } = getPeriodRange("month");
  const { data } = await supabase
    .from("lessons")
    .select("tutor_id, student_id")
    .eq("status", "completed")
    .gte("starts_at", start.toISOString())
    .lt("starts_at", end.toISOString());
  const byTutor = new Map<string, number>();
  const byStudent = new Map<string, number>();
  for (const l of data ?? []) {
    byTutor.set(l.tutor_id, (byTutor.get(l.tutor_id) ?? 0) + 1);
    byStudent.set(l.student_id, (byStudent.get(l.student_id) ?? 0) + 1);
  }
  return { byTutor, byStudent };
}

// Eğitmenler -------------------------------------------------------------------------

export async function listTutors() {
  const supabase = await createClient();
  const [{ data: tutors }, { data: assignments }, counts] = await Promise.all([
    supabase
      .from("tutors")
      .select(
        "id, university, department, yks_rank, payout_frequency, profile:profiles!inner(full_name, email, phone, is_active), tutor_subjects(subject:subjects(id, name, color))",
      ),
    supabase.from("tutor_students").select("tutor_id, student_id").eq("is_active", true),
    completedThisMonth(),
  ]);

  const studentCount = new Map<string, Set<string>>();
  for (const a of assignments ?? []) {
    if (!studentCount.has(a.tutor_id)) studentCount.set(a.tutor_id, new Set());
    studentCount.get(a.tutor_id)!.add(a.student_id);
  }

  return (tutors ?? [])
    .map((t) => ({
      id: t.id,
      fullName: t.profile.full_name,
      email: t.profile.email,
      phone: t.profile.phone,
      isActive: t.profile.is_active,
      university: t.university,
      department: t.department,
      yksRank: t.yks_rank,
      payoutFrequency: t.payout_frequency,
      subjects: t.tutor_subjects.map((s) => s.subject).filter((s) => s !== null),
      studentCount: studentCount.get(t.id)?.size ?? 0,
      lessonsThisMonth: counts.byTutor.get(t.id) ?? 0,
    }))
    .sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) || a.fullName.localeCompare(b.fullName, "tr"),
    );
}
export type TutorListItem = Awaited<ReturnType<typeof listTutors>>[number];

export async function getTutorDetail(id: string) {
  const supabase = await createClient();
  const [{ data: tutor }, { data: assignments }, { data: lessons }] = await Promise.all([
    supabase
      .from("tutors")
      .select(
        "*, profile:profiles!inner(full_name, email, phone, is_active), tutor_subjects(subject_id)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("tutor_students")
      .select(
        "id, lesson_type, subject:subjects(name, color), student:students(id, grade, goal, profile:profiles!inner(full_name, is_active))",
      )
      .eq("tutor_id", id)
      .eq("is_active", true),
    supabase
      .from("lessons")
      .select(
        "id, starts_at, ends_at, status, approval_status, lesson_type, topic, subject:subjects(name, color), student:students(profile:profiles!inner(full_name))",
      )
      .eq("tutor_id", id)
      .order("starts_at", { ascending: false })
      .limit(50),
  ]);
  if (!tutor) return null;
  return { tutor, assignments: assignments ?? [], lessons: lessons ?? [] };
}

// Öğrenciler -------------------------------------------------------------------------

export async function getCreditBalances(month: MonthKey = toMonthKey()) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_credit_balances", { p_month: month });
  return new Map((data ?? []).map((r) => [r.student_id, r]));
}
export type CreditBalance = NonNullable<
  ReturnType<Awaited<ReturnType<typeof getCreditBalances>>["get"]>
>;

export async function listStudents(month: MonthKey = toMonthKey()) {
  const supabase = await createClient();
  const [{ data: students }, credits] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, grade, goal, school, guardian_name, guardian_phone, profile:profiles!inner(full_name, email, phone, is_active), tutor_students(id, is_active, lesson_type, subject:subjects(name, color), tutor:tutors(id, profile:profiles!inner(full_name)))",
      ),
    getCreditBalances(month),
  ]);

  return (students ?? [])
    .map((s) => ({
      id: s.id,
      fullName: s.profile.full_name,
      email: s.profile.email,
      phone: s.profile.phone,
      isActive: s.profile.is_active,
      grade: s.grade,
      goal: s.goal,
      guardianName: s.guardian_name,
      guardianPhone: s.guardian_phone,
      assignments: s.tutor_students
        .filter((a) => a.is_active)
        .map((a) => ({
          id: a.id,
          lessonType: a.lesson_type,
          subject: a.subject,
          tutorName: a.tutor?.profile.full_name ?? "—",
        })),
      credit: credits.get(s.id) ?? null,
    }))
    .sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) || a.fullName.localeCompare(b.fullName, "tr"),
    );
}
export type StudentListItem = Awaited<ReturnType<typeof listStudents>>[number];

export async function getStudentDetail(id: string, month: MonthKey = toMonthKey()) {
  const supabase = await createClient();
  const [
    { data: student },
    { data: notes },
    { data: assignments },
    { data: packages },
    { data: lessons },
    { data: payments },
    credits,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*, profile:profiles!inner(full_name, email, phone, is_active)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("student_notes").select("notes").eq("student_id", id).maybeSingle(),
    supabase
      .from("tutor_students")
      .select(
        "id, lesson_type, assigned_at, subject:subjects(id, name, color), tutor:tutors(id, profile:profiles!inner(full_name))",
      )
      .eq("student_id", id)
      .eq("is_active", true)
      .order("assigned_at"),
    supabase
      .from("student_packages")
      .select("id, month, lesson_count, price_total, note")
      .eq("student_id", id)
      .order("month", { ascending: false }),
    supabase
      .from("lessons")
      .select(
        "id, starts_at, ends_at, status, approval_status, lesson_type, topic, is_free, subject:subjects(name, color), tutor:tutors(profile:profiles!inner(full_name))",
      )
      .eq("student_id", id)
      .order("starts_at", { ascending: false })
      .limit(100),
    supabase
      .from("payments")
      .select("id, amount, paid_at, method, note")
      .eq("student_id", id)
      .order("paid_at", { ascending: false }),
    getCreditBalances(month),
  ]);
  if (!student) return null;
  return {
    student,
    notes: notes?.notes ?? "",
    assignments: assignments ?? [],
    packages: packages ?? [],
    lessons: lessons ?? [],
    payments: payments ?? [],
    credit: credits.get(id) ?? null,
  };
}

/** Atama formu için aktif eğitmenler ve branşları */
export async function getTutorOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tutors")
    .select("id, profile:profiles!inner(full_name, is_active), tutor_subjects(subject_id)")
    .eq("profile.is_active", true);
  return (data ?? [])
    .map((t) => ({
      id: t.id,
      fullName: t.profile.full_name,
      subjectIds: t.tutor_subjects.map((s) => s.subject_id),
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
}
