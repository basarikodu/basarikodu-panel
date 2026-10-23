import type { LessonDisplayStatus } from "@/lib/constants";
import type { Enums } from "@/types/database";

/** Takvim ve ders detayında kullanılan, istemciye gönderilebilir ders görünümü */
export type CalendarLesson = {
  id: string;
  seriesId: string | null;
  startsAt: string;
  endsAt: string;
  status: Enums<"lesson_status">;
  approvalStatus: Enums<"approval_status">;
  displayStatus: LessonDisplayStatus;
  rejectionReason: string | null;
  lessonType: Enums<"lesson_type">;
  topic: string | null;
  meetingUrl: string | null;
  isFree: boolean;
  subjectName: string;
  color: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  pendingChange: {
    id: string;
    type: "reschedule" | "cancel";
    newStartsAt: string | null;
    newEndsAt: string | null;
    reason: string;
  } | null;
  lastRejectedChange: { type: "reschedule" | "cancel"; note: string | null } | null;
};
