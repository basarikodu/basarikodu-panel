import type { Metadata } from "next";
import { ProfileView } from "@/components/shared/profile-view";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Profil" };

export default async function Page() {
  const profile = await requireRole("student");
  return <ProfileView profile={profile} />;
}
