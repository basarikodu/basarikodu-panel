import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";

export default async function StudentLayout({ children }: LayoutProps<"/ogrenci">) {
  const profile = await requireRole("student");
  return <AppShell profile={profile}>{children}</AppShell>;
}
