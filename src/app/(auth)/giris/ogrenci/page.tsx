import type { Metadata } from "next";
import { RoleLogin } from "@/components/auth/role-login";

export const metadata: Metadata = { title: "Öğrenci / Veli Girişi" };

export default function StudentLoginPage() {
  return <RoleLogin role="student" />;
}
