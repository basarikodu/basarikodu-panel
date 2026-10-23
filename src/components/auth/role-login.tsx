import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";

const COPY = {
  student: {
    title: "Öğrenci / Veli Girişi",
    description: "Veliler öğrencinin hesabıyla giriş yapar.",
    other: { href: "/giris/egitmen", label: "Eğitmen girişi →" },
  },
  tutor: {
    title: "Eğitmen Girişi",
    description: "Hesabınıza giriş yapın.",
    other: { href: "/giris/ogrenci", label: "Öğrenci / veli girişi →" },
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-medium hover:text-foreground">
            ← Giriş seçimi
          </Link>
          <Link href={copy.other.href} className="font-semibold text-primary hover:underline">
            {copy.other.label}
          </Link>
        </div>
      }
    >
      <LoginForm gate={role} />
    </AuthCard>
  );
}
