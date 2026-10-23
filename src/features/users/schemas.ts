import { z } from "zod";
import { formValue } from "@/lib/action-state";

const optionalText = z.string().max(200).nullable();
const phone = z
  .string()
  .regex(/^[0-9 +()-]{7,20}$/, "Telefon numarası geçersiz")
  .nullable();

const accountFields = {
  full_name: z.string().min(2, "Ad soyad en az 2 karakter olmalı").max(100),
  email: z.email("Geçerli bir e-posta adresi girin").transform((v) => v.toLowerCase()),
  phone,
};

export const tutorSchema = z.object({
  ...accountFields,
  university: optionalText,
  department: optionalText,
  yks_rank: z.coerce.number().int().positive("YKS derecesi pozitif olmalı").nullable(),
  iban: z
    .string()
    .transform((v) => v.replace(/\s+/g, "").toUpperCase())
    .pipe(z.string().regex(/^TR\d{24}$/, "IBAN TR ile başlamalı ve 26 karakter olmalı"))
    .nullable(),
  payout_frequency: z.enum(["weekly", "monthly"]),
  default_meeting_url: z.url("Toplantı linki geçerli bir adres olmalı").nullable(),
  subjects: z.array(z.uuid()),
});
export type TutorInput = z.infer<typeof tutorSchema>;

export const studentSchema = z.object({
  ...accountFields,
  grade: z.coerce.number().int().min(1).max(13).nullable(),
  goal: z.enum(["yks", "lgs", "okul", "genel"]),
  school: optionalText,
  guardian_name: optionalText,
  guardian_phone: phone,
  notes: z.string().max(2000).nullable(),
});
export type StudentInput = z.infer<typeof studentSchema>;

export function readTutorForm(fd: FormData) {
  return tutorSchema.safeParse({
    full_name: formValue(fd, "full_name"),
    email: formValue(fd, "email"),
    phone: formValue(fd, "phone"),
    university: formValue(fd, "university"),
    department: formValue(fd, "department"),
    yks_rank: formValue(fd, "yks_rank"),
    iban: formValue(fd, "iban"),
    payout_frequency: formValue(fd, "payout_frequency") ?? "monthly",
    default_meeting_url: formValue(fd, "default_meeting_url"),
    subjects: fd.getAll("subjects").filter((v): v is string => typeof v === "string"),
  });
}

export function readStudentForm(fd: FormData) {
  return studentSchema.safeParse({
    full_name: formValue(fd, "full_name"),
    email: formValue(fd, "email"),
    phone: formValue(fd, "phone"),
    grade: formValue(fd, "grade"),
    goal: formValue(fd, "goal") ?? "okul",
    school: formValue(fd, "school"),
    guardian_name: formValue(fd, "guardian_name"),
    guardian_phone: formValue(fd, "guardian_phone"),
    notes: formValue(fd, "notes"),
  });
}

export const assignmentSchema = z.object({
  tutor_id: z.uuid("Eğitmen seçin"),
  subject_id: z.uuid("Branş seçin"),
  lesson_type: z.enum(["ozel_ders", "kocluk"]),
});
