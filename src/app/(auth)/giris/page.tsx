import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: PageProps<"/giris">) {
  const profile = await getCurrentProfile();
  if (profile) redirect(ROLE_HOME[profile.role]);
  const { hata } = await searchParams;

  return (
    <AuthCard
      title="Eğitmen / Öğrenci Girişi"
      description="Veliler, öğrencinin hesabıyla giriş yapabilir."
      footer={
        <Link href="/kurucu/giris" className="hover:underline">
          Kurucu girişi →
        </Link>
      }
    >
      <LoginForm
        gate="general"
        initialError={hata === "baglanti" ? "Bağlantının süresi dolmuş veya geçersiz." : undefined}
      />
    </AuthCard>
  );
}
