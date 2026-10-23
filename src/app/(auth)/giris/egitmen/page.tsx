import type { Metadata } from "next";
import { RoleLogin } from "@/components/auth/role-login";

export const metadata: Metadata = { title: "Eğitmen Girişi" };

export default function TutorLoginPage() {
  return <RoleLogin role="tutor" />;
}
