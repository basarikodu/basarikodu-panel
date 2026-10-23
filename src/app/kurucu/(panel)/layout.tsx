import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

async function countPendingApprovals() {
  const supabase = await createClient();
  const [lessons, changes] = await Promise.all([
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("lesson_change_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return (lessons.count ?? 0) + (changes.count ?? 0);
}

export default async function FounderLayout({ children }: LayoutProps<"/kurucu">) {
  const profile = await requireRole("founder");
  const pendingApprovals = await countPendingApprovals();

  return (
    <AppShell profile={profile} badges={{ pendingApprovals }}>
      {children}
    </AppShell>
  );
}
