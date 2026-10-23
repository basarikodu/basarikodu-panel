import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";

export const metadata: Metadata = { title: "Kurucu Girişi" };

export default async function FounderLoginPage() {
  const profile = await getCurrentProfile();
  if (profile) redirect(ROLE_HOME[profile.role]);

  return (
    <AuthCard
      dark
      title="Kurucu Girişi"
      description="Yönetim paneli yalnızca kurucular içindir."
      footer={
        <Link href="/giris" className="hover:underline">
          ← Eğitmen / Öğrenci girişi
        </Link>
      }
    >
      <LoginForm gate="founder" />
    </AuthCard>
  );
}
