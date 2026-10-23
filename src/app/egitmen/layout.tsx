import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function TutorLayout({ children }: LayoutProps<"/egitmen">) {
  const profile = await requireRole("tutor");
  return <AppShell profile={profile}>{children}</AppShell>;
}
