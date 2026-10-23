import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";

const COPY = {
  student: {
    title: "Öğrenci / Veli Girişi",
    description: "Derslerini, ders hakkını ve geçmişini gör. Veliler öğrencinin hesabıyla girer.",
    other: { href: "/giris/egitmen", label: "Eğitmen misiniz? Eğitmen girişi →" },
  },
  tutor: {
    title: "Eğitmen Girişi",
    description: "Haftalık ders planını yap, derslerini ve öğrencilerini yönet.",
    other: { href: "/giris/ogrenci", label: "Öğrenci veya veli misiniz? Öğrenci girişi →" },
  },
} as const;

/** Öğrenci ve eğitmen için ayrı giriş sayfası (kurucu girişi /kurucu/giris) */
export async function RoleLogin({ role }: { role: "student" | "tutor" }) {
  const profile = await getCurrentProfile();
  if (profile) redirect(ROLE_HOME[profile.role]);
  const copy = COPY[role];

  return (
    <AuthCard
      title={copy.title}
      description={copy.description}
      footer={
        <div className="flex flex-col items-center gap-2">
          <Link href={copy.other.href} className="hover:underline">
            {copy.other.label}
          </Link>
          <Link href="/" className="text-xs hover:underline">
            ← Ana sayfa
          </Link>
        </div>
      }
    >
      <LoginForm gate={role} />
    </AuthCard>
  );
}
