// Kontrol/deneme için 1 eğitmen + 1 öğrenci açar, Matematik ataması ve bu ayın paketini tanımlar.
// E-postalar *.demo@basarikodu.com olduğu için supabase/scripts/demo-temizle.sql ile silinebilir.
// Geçici şifreler git'e girmeyen scripts/demo-sifreler.local.md dosyasına yazılır.
//   node scripts/demo-hesaplar.mjs

import { randomInt } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const tempPassword = () => `bk-${part()}-${part()}`;

async function createAccount(email, full_name, role, phone) {
  const password = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (error) throw new Error(`${email}: ${error.message}`);
  const id = data.user.id;
  const { error: pErr } = await admin.from("profiles").insert({ id, role, full_name, email, phone });
  if (pErr) {
    await admin.auth.admin.deleteUser(id);
    throw new Error(`${email} profil: ${pErr.message}`);
  }
  return { id, email, password, full_name };
}

const { data: math } = await admin.from("subjects").select("id").eq("name", "Matematik").single();
const { data: settings } = await admin.from("app_settings").select("lesson_price_multi").eq("id", 1).single();

const tutor = await createAccount("egitmen.demo@basarikodu.com", "Deneme Eğitmen", "tutor", "05550000001");
await admin.from("tutors").insert({
  id: tutor.id,
  university: "Deneme Üniversitesi",
  department: "Matematik Öğretmenliği",
  payout_frequency: "monthly",
  default_meeting_url: "https://meet.google.com/deneme-ders",
});
await admin.from("tutor_subjects").insert({ tutor_id: tutor.id, subject_id: math.id });

const student = await createAccount("ogrenci.demo@basarikodu.com", "Deneme Öğrenci", "student", "05550000002");
await admin.from("students").insert({
  id: student.id,
  grade: 12,
  goal: "yks",
  school: "Deneme Lisesi",
  guardian_name: "Deneme Veli",
  guardian_phone: "05550000003",
});

await admin.from("tutor_students").insert({
  tutor_id: tutor.id,
  student_id: student.id,
  subject_id: math.id,
  lesson_type: "ozel_ders",
});

// Bu ayın (İstanbul) paketi: 8 ders, haftada 2+ fiyatıyla
const now = new Date(Date.now() + 3 * 3600_000);
const month = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
await admin.from("student_packages").insert({
  student_id: student.id,
  month,
  lesson_count: 8,
  price_total: 8 * Number(settings.lesson_price_multi),
  note: "Deneme paketi",
});

writeFileSync(
  "scripts/demo-sifreler.local.md",
  [
    "# Deneme hesapları (git'e girmez)",
    "",
    "| Rol | Giriş adresi | E-posta | Geçici şifre |",
    "|---|---|---|---|",
    `| Eğitmen | /giris/egitmen | ${tutor.email} | \`${tutor.password}\` |`,
    `| Öğrenci / Veli | /giris/ogrenci | ${student.email} | \`${student.password}\` |`,
    "",
    "Silmek için: supabase/scripts/demo-temizle.sql",
    "",
  ].join("\n"),
  "utf8",
);
console.log(`✓ Eğitmen: ${tutor.full_name} <${tutor.email}>`);
console.log(`✓ Öğrenci: ${student.full_name} <${student.email}> · Matematik ataması · ${month} 8 ders paketi`);
console.log("Geçici şifreler: scripts/demo-sifreler.local.md");
