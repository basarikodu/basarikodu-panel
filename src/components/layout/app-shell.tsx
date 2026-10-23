import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import type { CurrentProfile } from "@/lib/auth";
import { NAV, ROLE_LABEL } from "./nav-config";
import { BottomNav, SidebarNav, type NavBadges } from "./nav-links";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
    .join("");
}

export function AppShell({
  profile,
  badges,
  children,
}: {
  profile: CurrentProfile;
  badges?: NavBadges;
  children: React.ReactNode;
}) {
  const home = NAV[profile.role][0].href;

  return (
    <div className="flex min-h-svh">
      {/* Masaüstü yan menü */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col bg-sidebar p-4 md:flex">
        <Link href={home} className="px-2 py-1">
          <Logo inverted />
        </Link>
        <div className="mt-8 flex-1 overflow-y-auto">
          <SidebarNav role={profile.role} badges={badges} />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-bold text-white">
            {initials(profile.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{profile.fullName}</p>
            <p className="text-xs text-sidebar-foreground/70">{ROLE_LABEL[profile.role]}</p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              aria-label="Çıkış yap"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
            >
              <LogOutIcon className="size-4" />
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil üst bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <form action={signOut}>
            <Button type="submit" size="sm" variant="ghost" className="text-muted-foreground">
              <LogOutIcon className="size-4" /> Çıkış
            </Button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 md:px-8 md:py-8">
          {children}
        </main>
      </div>

      <BottomNav role={profile.role} badges={badges} />
    </div>
  );
}
