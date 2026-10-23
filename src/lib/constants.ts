// Alan sözlüğü: kod İngilizce, arayüz Türkçe (CLAUDE.md).

export const LESSON_STATUSES = [
  "planned",
  "completed",
  "no_show",
  "cancelled_by_student",
  "cancelled_by_tutor",
  "postponed",
] as const;
export type LessonStatus = (typeof LESSON_STATUSES)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** Takvim ve rozetlerde gösterilen birleşik durum. */
export type LessonDisplayStatus = LessonStatus | "pending_approval" | "rejected";

export const LESSON_STATUS_LABELS: Record<LessonDisplayStatus, string> = {
  pending_approval: "Onay bekliyor",
  rejected: "Reddedildi",
  planned: "Planlandı",
  completed: "Tamamlandı",
  no_show: "Öğrenci gelmedi",
  cancelled_by_student: "İptal (öğrenci)",
  cancelled_by_tutor: "İptal (eğitmen)",
  postponed: "Ertelendi",
};

export const LESSON_TYPES = ["ozel_ders", "kocluk"] as const;
export type LessonType = (typeof LESSON_TYPES)[number];

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  ozel_ders: "Özel ders",
  kocluk: "Koçluk",
};

export const DEFAULT_DURATION_MIN: Record<LessonType, number> = {
  ozel_ders: 60,
  kocluk: 40,
};

export const STUDENT_GOAL_LABELS = {
  yks: "YKS",
  lgs: "LGS",
  okul: "Okul başarısı",
  genel: "Genel gelişim",
} as const;
export type StudentGoal = keyof typeof STUDENT_GOAL_LABELS;

export const PACKAGE_PRESETS = [4, 8, 12] as const;

export const SUPPORT_WHATSAPP_URL = "https://wa.me/905392540064";
