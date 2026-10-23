"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbFail, fail, formValue, ok, zodFail, type ActionState } from "@/lib/action-state";
import { getCurrentProfile, requireRole } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { buildOccurrences, findConflicts, istanbulToUtc, isDateKey, isTimeValue } from "./rules";

function revalidateLessons() {
  revalidatePath("/egitmen", "layout");
  revalidatePath("/kurucu", "layout");
  revalidatePath("/ogrenci", "layout");
}

const planSchema = z.object({
  assignment_id: z.uuid("Branş seçin"),
  date: z.string().refine(isDateKey, "Tarih seçin"),
  time: z.string().refine(isTimeValue, "Saat seçin"),
  meeting_url: z.url("Ders linki geçerli bir adres olmalı").nullable(),
});

/** Tek ders planlar; süre branşa göre Ayarlar'dan gelir. Eğitmenin dersi onaya düşer. */
export async function planLessons(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const me = await getCurrentProfile();
  if (!me || (me.role !== "tutor" && me.role !== "founder")) return fail("Yetkiniz yok");

  const parsed = planSchema.safeParse({
    assignment_id: formValue(fd, "assignment_id"),
    date: formValue(fd, "date"),
    time: formValue(fd, "time"),
    meeting_url: formValue(fd, "meeting_url"),
  });
  if (!parsed.success) return zodFail(parsed.error);
  const input = parsed.data;

  const supabase = await createClient();
  const [{ data: assignment }, { data: settings }] = await Promise.all([
    supabase
      .from("tutor_students")
      .select("tutor_id, student_id, subject_id, lesson_type, is_active")
      .eq("id", input.assignment_id)
      .maybeSingle(),
    supabase
      .from("app_settings")
      .select("duration_private, duration_coaching")
      .eq("id", 1)
      .maybeSingle(),
  ]);
  if (!assignment || !assignment.is_active) return fail("Bu öğrenci size atanmamış");
  if (me.role === "tutor" && assignment.tutor_id !== me.id)
    return fail("Bu öğrenci size atanmamış");

  const duration =
    assignment.lesson_type === "kocluk"
      ? (settings?.duration_coaching ?? 40)
      : (settings?.duration_private ?? 60);
  const [lesson] = buildOccurrences(input.date, input.time, duration, 1);
  if (Date.parse(lesson.starts_at) < Date.now() - 60_000 && me.role === "tutor") {
    return fail("Geçmiş bir saate ders planlanamaz");
  }

  // Görebildiğimiz derslerle çakışma ön kontrolü (asıl garanti veritabanı kısıtında)
  const { data: existing } = await supabase
    .from("lessons")
    .select("starts_at, ends_at")
    .or(`tutor_id.eq.${assignment.tutor_id},student_id.eq.${assignment.student_id}`)
    .eq("status", "planned")
    .neq("approval_status", "rejected")
    .lt("starts_at", lesson.ends_at)
    .gt("ends_at", lesson.starts_at);
  const [conflict] = findConflicts([lesson], existing ?? []);
  if (conflict) {
    return fail(
      `Bu saatte başka ders var: ${formatDate(conflict.starts_at)} ${formatTime(conflict.starts_at)}`,
    );
  }

  const { error } = await supabase.from("lessons").insert({
    ...lesson,
    tutor_id: assignment.tutor_id,
    student_id: assignment.student_id,
    subject_id: assignment.subject_id,
    lesson_type: assignment.lesson_type,
    meeting_url: input.meeting_url,
  });
  if (error) return dbFail(error);

  revalidateLessons();
  return ok(me.role === "founder" ? "Ders eklendi" : "Ders kurucu onayına gönderildi");
}

const changeSchema = z.discriminatedUnion("request_type", [
  z.object({
    request_type: z.literal("reschedule"),
    date: z.string().refine(isDateKey, "Yeni tarihi seçin"),
    time: z.string().refine(isTimeValue, "Yeni saati seçin"),
    reason: z.string().min(3, "Kısa bir açıklama yazın").max(500),
  }),
  z.object({
    request_type: z.literal("cancel"),
    cancel_status: z.enum(["cancelled_by_student", "cancelled_by_tutor"]),
    reason: z.string().min(3, "Kısa bir açıklama yazın").max(500),
  }),
]);

/** Onaylı ders için erteleme / iptal talebi (kurucu onaylayınca uygulanır) */
export async function requestLessonChange(
  lessonId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("tutor");
  const parsed = changeSchema.safeParse({
    request_type: formValue(fd, "request_type"),
    date: formValue(fd, "date"),
    time: formValue(fd, "time"),
    cancel_status: formValue(fd, "cancel_status") ?? "cancelled_by_student",
    reason: formValue(fd, "reason") ?? "",
  });
  if (!parsed.success) return zodFail(parsed.error);
  const input = parsed.data;

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("starts_at, ends_at")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return fail("Ders bulunamadı");

  let row;
  if (input.request_type === "reschedule") {
    const duration = Date.parse(lesson.ends_at) - Date.parse(lesson.starts_at);
    const start = istanbulToUtc(input.date, input.time);
    if (start.getTime() < Date.now()) return fail("Yeni tarih ileri bir zaman olmalı");
    row = {
      lesson_id: lessonId,
      request_type: "reschedule" as const,
      new_starts_at: start.toISOString(),
      new_ends_at: new Date(start.getTime() + duration).toISOString(),
      reason: input.reason,
    };
  } else {
    row = {
      lesson_id: lessonId,
      request_type: "cancel" as const,
      cancel_status: input.cancel_status,
      reason: input.reason,
    };
  }

  const { error } = await supabase.from("lesson_change_requests").insert(row);
  if (error) {
    if (error.code === "23505") return fail("Bu ders için zaten bekleyen bir talep var");
    if (error.code === "42501") return fail("Bu ders için talep oluşturulamaz");
    return dbFail(error);
  }

  revalidateLessons();
  return ok(
    input.request_type === "reschedule"
      ? "Erteleme talebi kurucu onayına gönderildi"
      : "İptal talebi kurucu onayına gönderildi",
  );
}

export async function withdrawChangeRequest(requestId: string): Promise<ActionState> {
  await requireRole("tutor");
  const supabase = await createClient();
  const { error } = await supabase.from("lesson_change_requests").delete().eq("id", requestId);
  if (error) return dbFail(error);
  revalidateLessons();
  return ok("Talep geri çekildi");
}

/** Onaylanmamış (bekleyen/reddedilen) dersi siler */
export async function withdrawLesson(lessonId: string): Promise<ActionState> {
  await requireRole("tutor");
  const supabase = await createClient();
  const { data, error } = await supabase.from("lessons").delete().eq("id", lessonId).select("id");
  if (error) return dbFail(error);
  if (!data?.length) return fail("Onaylanmış ders geri çekilemez; iptal talebi gönderin");
  revalidateLessons();
  return ok("Ders geri çekildi");
}

const resultSchema = z.object({
  status: z.enum(["completed", "no_show", "planned"]),
  topic: z.string().max(1000).nullable(),
});

/** Ders sonucu: tamamlandı / öğrenci gelmedi (onaysız kaydedilir) */
export async function recordLessonResult(
  lessonId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const me = await getCurrentProfile();
  if (!me || (me.role !== "tutor" && me.role !== "founder")) return fail("Yetkiniz yok");
  const parsed = resultSchema.safeParse({
    status: formValue(fd, "status"),
    topic: formValue(fd, "topic"),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .update(parsed.data)
    .eq("id", lessonId)
    .select("id");
  if (error) return dbFail(error);
  if (!data?.length) return fail("Ders bulunamadı");

  revalidateLessons();
  const labels = {
    completed: "Ders tamamlandı olarak kaydedildi",
    no_show: "Öğrenci gelmedi olarak kaydedildi",
    planned: "Sonuç geri alındı",
  };
  return ok(labels[parsed.data.status]);
}

// Kurucu onayları -------------------------------------------------------------------

export async function approveLessons(lessonIds: string[]): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_lessons", {
    p_lesson_ids: lessonIds,
    p_approve: true,
  });
  if (error) return dbFail(error);
  revalidateLessons();
  return ok(data && data > 1 ? `${data} ders onaylandı` : "Ders onaylandı");
}

export async function rejectLessons(
  lessonIds: string[],
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const reason = formValue(fd, "reason");
  if (!reason) return fail("Eğitmenin göreceği bir red sebebi yazın");
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_lessons", {
    p_lesson_ids: lessonIds,
    p_approve: false,
    p_reason: reason,
  });
  if (error) return dbFail(error);
  revalidateLessons();
  return ok("Talep reddedildi");
}

export async function approveChangeRequest(requestId: string): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_change_request", {
    p_request_id: requestId,
    p_approve: true,
  });
  if (error) return dbFail(error);
  revalidateLessons();
  return ok("Talep onaylandı ve derse uygulandı");
}

export async function rejectChangeRequest(
  requestId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const note = formValue(fd, "reason");
  if (!note) return fail("Eğitmenin göreceği bir red sebebi yazın");
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_change_request", {
    p_request_id: requestId,
    p_approve: false,
    p_note: note,
  });
  if (error) return dbFail(error);
  revalidateLessons();
  return ok("Talep reddedildi; ders olduğu gibi kaldı");
}

// Kurucu doğrudan düzenleme ----------------------------------------------------------

const founderEditSchema = z.object({
  status: z.enum(["planned", "completed", "no_show", "cancelled_by_student", "cancelled_by_tutor"]),
  date: z.string().refine(isDateKey, "Tarih seçin"),
  time: z.string().refine(isTimeValue, "Saat seçin"),
  topic: z.string().max(1000).nullable(),
});

/** Kurucu: dersin durumunu, tarihini/saatini ve notunu onaysız günceller */
export async function founderUpdateLesson(
  lessonId: string,
  _prev: ActionState,
  fd: FormData,
): Promise<ActionState> {
  await requireRole("founder");
  const parsed = founderEditSchema.safeParse({
    status: formValue(fd, "status"),
    date: formValue(fd, "date"),
    time: formValue(fd, "time"),
    topic: formValue(fd, "topic"),
  });
  if (!parsed.success) return zodFail(parsed.error);

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("starts_at, ends_at")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return fail("Ders bulunamadı");

  const duration = Date.parse(lesson.ends_at) - Date.parse(lesson.starts_at);
  const start = istanbulToUtc(parsed.data.date, parsed.data.time);
  const { error } = await supabase
    .from("lessons")
    .update({
      status: parsed.data.status,
      topic: parsed.data.topic,
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + duration).toISOString(),
    })
    .eq("id", lessonId);
  if (error) return dbFail(error);

  revalidateLessons();
  return ok("Ders güncellendi");
}

export async function founderDeleteLesson(lessonId: string): Promise<ActionState> {
  await requireRole("founder");
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("payout_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (lesson?.payout_id) return fail("Eğitmen ödemesi yapılmış ders silinemez");
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) return dbFail(error);
  revalidateLessons();
  return ok("Ders silindi");
}
