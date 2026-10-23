import "server-only";
import { displayStatus } from "@/components/shared/lesson-table";
import { getCreditBalances } from "@/features/users/queries";
import { createClient } from "@/lib/supabase/server";
import { addDays, istanbulToUtc, type DateKey } from "./rules";
import type { CalendarLesson } from "./types";

const LESSON_FIELDS =
  "id, series_id, tutor_id, starts_at, ends_at, status, approval_status, rejection_reason, lesson_type, topic, meeting_url, is_free, subject:subjects(name, color), student:students(id, profile:profiles!inner(full_name)), tutor:tutors(id, profile:profiles!inner(full_name)), lesson_change_requests(id, request_type, new_starts_at, new_ends_at, cancel_status, reason, status, review_note, created_at)";

export type LessonRow = {
  id: string;
  series_id: string | null;
  tutor_id: string;
  starts_at: string;
  ends_at: string;
  status: CalendarLesson["status"];
  approval_status: CalendarLesson["approvalStatus"];
  rejection_reason: string | null;
  lesson_type: CalendarLesson["lessonType"];
  topic: string | null;
  meeting_url: string | null;
  is_free: boolean;
  subject: { name: string; color: string } | null;
  student: { id: string; profile: { full_name: string } } | null;
  tutor: { id: string; profile: { full_name: string } } | null;
  lesson_change_requests: {
    id: string;
    request_type: "reschedule" | "cancel";
    new_starts_at: string | null;
    new_ends_at: string | null;
    cancel_status: string | null;
    reason: string;
    status: "pending" | "approved" | "rejected";
    review_note: string | null;
    created_at: string;
  }[];
};

export function toCalendarLesson(l: LessonRow): CalendarLesson {
  const requests = [...(l.lesson_change_requests ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  const pending = requests.find((r) => r.status === "pending");
  const lastRejected = requests.find((r) => r.status === "rejected");
  return {
    id: l.id,
    seriesId: l.series_id,
    startsAt: l.starts_at,
    endsAt: l.ends_at,
    status: l.status,
    approvalStatus: l.approval_status,
    displayStatus: displayStatus(l),
    rejectionReason: l.rejection_reason,
    lessonType: l.lesson_type,
    topic: l.topic,
    meetingUrl: l.meeting_url,
    isFree: l.is_free,
    subjectName: l.subject?.name ?? "",
    color: l.subject?.color ?? "#0b3478",
    studentId: l.student?.id ?? "",
    studentName: l.student?.profile.full_name ?? "",
    tutorId: l.tutor_id,
    tutorName: l.tutor?.profile.full_name ?? "",
    pendingChange: pending
      ? {
          id: pending.id,
          type: pending.request_type,
          newStartsAt: pending.new_starts_at,
          newEndsAt: pending.new_ends_at,
          reason: pending.reason,
        }
      : null,
    lastRejectedChange: lastRejected
      ? { type: lastRejected.request_type, note: lastRejected.review_note }
      : null,
  };
}

/** Bir haftanın dersleri (RLS: eğitmen kendi derslerini, öğrenci kendi onaylı derslerini görür) */
export async function getWeekLessons(
  weekStart: DateKey,
  filter: { tutorId?: string; studentId?: string } = {},
) {
  const supabase = await createClient();
  let q = supabase
    .from("lessons")
    .select(LESSON_FIELDS)
    .gte("starts_at", istanbulToUtc(weekStart).toISOString())
    .lt("starts_at", istanbulToUtc(addDays(weekStart, 7)).toISOString())
    .order("starts_at");
  if (filter.tutorId) q = q.eq("tutor_id", filter.tutorId);
  if (filter.studentId) q = q.eq("student_id", filter.studentId);
  const { data } = await q;
  return ((data ?? []) as unknown as LessonRow[]).map(toCalendarLesson);
}

/** Eğitmenin ders planlama seçenekleri: atanmış öğrenciler, kalan hak, varsayılanlar */
export async function getTutorPlanningContext(tutorId: string) {
  const supabase = await createClient();
  const [{ data: assignments }, { data: tutor }, { data: settings }, credits] = await Promise.all([
    supabase
      .from("tutor_students")
      .select(
        "id, lesson_type, subject:subjects(name, color), student:students(id, grade, profile:profiles!inner(full_name, is_active))",
      )
      .eq("tutor_id", tutorId)
      .eq("is_active", true),
    supabase.from("tutors").select("default_meeting_url").eq("id", tutorId).maybeSingle(),
    supabase
      .from("app_settings")
      .select("duration_private, duration_coaching")
      .eq("id", 1)
      .maybeSingle(),
    getCreditBalances(),
  ]);

  const options = (assignments ?? [])
    .filter((a) => a.student?.profile.is_active)
    .map((a) => ({
      id: a.id,
      studentId: a.student!.id,
      studentName: a.student!.profile.full_name,
      subjectName: a.subject?.name ?? "",
      lessonType: a.lesson_type,
      remaining: credits.get(a.student!.id)?.remaining ?? null,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "tr"));

  return {
    assignments: options,
    defaultMeetingUrl: tutor?.default_meeting_url ?? null,
    durations: {
      ozel_ders: settings?.duration_private ?? 60,
      kocluk: settings?.duration_coaching ?? 40,
    },
  };
}
export type PlanningContext = Awaited<ReturnType<typeof getTutorPlanningContext>>;

/** Eğitmenin özet sayıları */
export async function getTutorStats(tutorId: string, now = new Date()) {
  const supabase = await createClient();
  const today = new Date(now.getTime() + 3 * 3600_000).toISOString().slice(0, 10);
  const dayStart = istanbulToUtc(today).toISOString();
  const dayEnd = istanbulToUtc(addDays(today, 1)).toISOString();
  const base = () =>
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("tutor_id", tutorId);

  const [todayRes, pendingRes, missingRes, changeRes] = await Promise.all([
    base().gte("starts_at", dayStart).lt("starts_at", dayEnd).eq("approval_status", "approved"),
    base().eq("approval_status", "pending"),
    base()
      .eq("approval_status", "approved")
      .eq("status", "planned")
      .lt("starts_at", now.toISOString()),
    supabase
      .from("lesson_change_requests")
      .select("id", { count: "exact", head: true })
      .eq("requested_by", tutorId)
      .eq("status", "pending"),
  ]);
  return {
    today: todayRes.count ?? 0,
    pending: (pendingRes.count ?? 0) + (changeRes.count ?? 0),
    missingResults: missingRes.count ?? 0,
  };
}

/** Sonucu girilmemiş geçmiş dersler (eğitmen uyarısı) */
export async function getMissingResults(tutorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(LESSON_FIELDS)
    .eq("tutor_id", tutorId)
    .eq("approval_status", "approved")
    .eq("status", "planned")
    .lt("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(20);
  return ((data ?? []) as unknown as LessonRow[]).map(toCalendarLesson);
}

/** Kurucu: onay bekleyen yeni dersler (seri bazında gruplu) ve değişiklik talepleri */
export async function getPendingApprovals() {
  const supabase = await createClient();
  const [{ data: lessons }, { data: changes }] = await Promise.all([
    supabase
      .from("lessons")
      .select(`${LESSON_FIELDS}, created_at`)
      .eq("approval_status", "pending")
      .order("starts_at"),
    supabase
      .from("lesson_change_requests")
      .select(
        `id, request_type, new_starts_at, new_ends_at, cancel_status, reason, created_at, lesson:lessons!inner(${LESSON_FIELDS})`,
      )
      .eq("status", "pending")
      .order("created_at"),
  ]);

  const groups = new Map<string, CalendarLesson[]>();
  for (const l of ((lessons ?? []) as unknown as LessonRow[]).map(toCalendarLesson)) {
    const key = l.seriesId ?? l.id;
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }

  return {
    lessonGroups: [...groups.values()],
    changeRequests: (changes ?? []).map((c) => ({
      id: c.id,
      type: c.request_type,
      newStartsAt: c.new_starts_at,
      newEndsAt: c.new_ends_at,
      cancelStatus: c.cancel_status,
      reason: c.reason,
      createdAt: c.created_at,
      lesson: toCalendarLesson(c.lesson as unknown as LessonRow),
    })),
  };
}

/** Eğitmenin öğrencileri: atama, kalan hak, son/sıradaki ders */
export async function getTutorStudents(tutorId: string) {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  const [{ data: assignments }, { data: lessons }, credits] = await Promise.all([
    supabase
      .from("tutor_students")
      .select(
        "id, lesson_type, subject:subjects(name, color), student:students(id, grade, goal, guardian_name, guardian_phone, profile:profiles!inner(full_name, phone, is_active))",
      )
      .eq("tutor_id", tutorId)
      .eq("is_active", true),
    supabase
      .from("lessons")
      .select("student_id, starts_at, status, approval_status")
      .eq("tutor_id", tutorId)
      .neq("approval_status", "rejected")
      .order("starts_at"),
    getCreditBalances(),
  ]);

  const byStudent = new Map<
    string,
    {
      student: NonNullable<NonNullable<typeof assignments>[number]["student"]>;
      subjects: { name: string; color: string; lessonType: string }[];
    }
  >();
  for (const a of assignments ?? []) {
    if (!a.student) continue;
    const entry = byStudent.get(a.student.id) ?? { student: a.student, subjects: [] };
    if (a.subject) entry.subjects.push({ ...a.subject, lessonType: a.lesson_type });
    byStudent.set(a.student.id, entry);
  }

  return [...byStudent.values()]
    .map(({ student, subjects }) => {
      const own = (lessons ?? []).filter((l) => l.student_id === student.id);
      const next = own.find((l) => l.starts_at >= nowIso && l.status === "planned");
      const last = [...own].reverse().find((l) => l.status === "completed");
      return {
        id: student.id,
        fullName: student.profile.full_name,
        phone: student.profile.phone,
        isActive: student.profile.is_active,
        grade: student.grade,
        goal: student.goal,
        guardianName: student.guardian_name,
        guardianPhone: student.guardian_phone,
        subjects,
        completedCount: own.filter((l) => l.status === "completed").length,
        nextLessonAt: next?.starts_at ?? null,
        lastLessonAt: last?.starts_at ?? null,
        credit: credits.get(student.id) ?? null,
      };
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
}

/** Eğitmenin bir öğrenciyle yaptığı tüm dersler */
export async function getTutorStudentLessons(tutorId: string, studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(LESSON_FIELDS)
    .eq("tutor_id", tutorId)
    .eq("student_id", studentId)
    .order("starts_at", { ascending: false });
  return ((data ?? []) as unknown as LessonRow[]).map(toCalendarLesson);
}

/** Kurucu: tüm aktif eşleştirmeler (ders ekleme formu) ve filtre seçenekleri */
export async function getFounderPlanningContext() {
  const supabase = await createClient();
  const [{ data: assignments }, { data: settings }, credits] = await Promise.all([
    supabase
      .from("tutor_students")
      .select(
        "id, lesson_type, subject:subjects(name), student:students(id, profile:profiles!inner(full_name, is_active)), tutor:tutors(id, default_meeting_url, profile:profiles!inner(full_name, is_active))",
      )
      .eq("is_active", true),
    supabase
      .from("app_settings")
      .select("duration_private, duration_coaching")
      .eq("id", 1)
      .maybeSingle(),
    getCreditBalances(),
  ]);

  const rows = (assignments ?? []).filter(
    (a) => a.student?.profile.is_active && a.tutor?.profile.is_active,
  );
  const context: PlanningContext = {
    assignments: rows
      .map((a) => ({
        id: a.id,
        studentId: a.student!.id,
        studentName: a.student!.profile.full_name,
        subjectName: `${a.subject?.name ?? ""} · ${a.tutor!.profile.full_name}`,
        lessonType: a.lesson_type,
        remaining: credits.get(a.student!.id)?.remaining ?? null,
      }))
      .sort((a, b) => a.studentName.localeCompare(b.studentName, "tr")),
    defaultMeetingUrl: null,
    durations: {
      ozel_ders: settings?.duration_private ?? 60,
      kocluk: settings?.duration_coaching ?? 40,
    },
  };

  const uniq = (list: { value: string; label: string }[]) =>
    [...new Map(list.map((o) => [o.value, o])).values()].sort((a, b) =>
      a.label.localeCompare(b.label, "tr"),
    );
  return {
    context,
    tutorOptions: uniq(
      rows.map((a) => ({ value: a.tutor!.id, label: a.tutor!.profile.full_name })),
    ),
    studentOptions: uniq(
      rows.map((a) => ({ value: a.student!.id, label: a.student!.profile.full_name })),
    ),
  };
}
