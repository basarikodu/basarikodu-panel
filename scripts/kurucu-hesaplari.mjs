// Kurucu hesaplarını geçici şifreyle açar (panelde kurucu açma ekranı bilerek yoktur).
//
// Kullanım:
//   1) scripts/kurucular.example.json dosyasını scripts/kurucular.local.json olarak kopyalayıp doldurun
//   2) node scripts/kurucu-hesaplari.mjs
// Geçici şifreler ekrana yazılmaz; git'e girmeyen scripts/kurucular-sifreler.local.md dosyasına yazılır.

import { randomInt } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local içinde olmalı");
  process.exit(1);
}

const INPUT = "scripts/kurucular.local.json";
const OUTPUT = "scripts/kurucular-sifreler.local.md";
if (!existsSync(INPUT)) {
  console.error(`${INPUT} bulunamadı (örnek: scripts/kurucular.example.json)`);
  process.exit(1);
}

/** @type {{ full_name: string; email: string; phone?: string }[]} */
const founders = JSON.parse(readFileSync(INPUT, "utf8"));
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
const tempPassword = () => `bk-${part()}-${part()}`;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const lines = [
  "# Kurucu hesapları (git'e girmez)",
  "",
  "Giriş: https://panel.basarikodu.com/kurucu/giris — ilk girişten sonra Profil'den şifre değiştirin.",
  "",
  "| Ad Soyad | E-posta | Geçici şifre |",
  "|---|---|---|",
];

for (const f of founders) {
  const email = f.email.trim().toLowerCase();
  const full_name = f.full_name.trim();
  if (!email || !full_name) {
    console.error(`Atlandı (eksik bilgi): ${JSON.stringify(f)}`);
    continue;
  }
  const password = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (error || !data.user) {
    console.error(`✗ ${email}: ${error?.message ?? "hesap oluşturulamadı"}`);
    continue;
  }
  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    role: "founder",
    full_name,
    email,
    phone: f.phone?.trim() || null,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    console.error(`✗ ${email}: profil oluşturulamadı (${profileError.message})`);
    continue;
  }
  lines.push(`| ${full_name} | ${email} | \`${password}\` |`);
  console.log(`✓ ${full_name} <${email}> kurucu olarak açıldı`);
}

writeFileSync(OUTPUT, `${lines.join("\n")}\n`, "utf8");
console.log(`Geçici şifreler: ${OUTPUT}`);
