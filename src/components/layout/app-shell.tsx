import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/actions";
import type { CurrentProfile } from "@/lib/auth";
import { NAV, ROLE_LABEL } from "./nav-config";
import { BottomNav, SidebarNav, type NavBadges } from "./nav-links";

const PANEL_LABEL = {
  founder: "Kurucu Paneli",
  tutor: "Eğitmen Paneli",
  student: "Öğrenci Paneli",
} as const;

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
      {/* Masaüstü: yüzen koyu yan menü */}
      <aside className="sticky top-0 hidden h-svh w-[296px] shrink-0 p-4 md:block">
        <div className="flex h-full flex-col rounded-[28px] bg-gradient-to-b from-[#0d1f4d] via-sidebar to-[#081331] p-4 text-sidebar-foreground shadow-xl shadow-[#0b1a40]/20">
          <Link href={home} className="px-2 pt-1 pb-4">
            <Logo inverted size={38} />
          </Link>

          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#2e8220] text-sm font-bold text-white">
              BK
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{PANEL_LABEL[profile.role]}</p>
              <p className="text-xs text-sidebar-foreground/70">BaşarıKodu · Özel Ders & Koçluk</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <SidebarNav role={profile.role} badges={badges} />
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 px-1 pt-4">
            <UserAvatar name={profile.fullName} className="ring-2 ring-white/15" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile.fullName}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {profile.email ?? ROLE_LABEL[profile.role]}
              </p>
            </div>
            <form action={signOut}>
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                aria-label="Çıkış yap"
                className="text-sidebar-foreground hover:bg-white/10 hover:text-white"
              >
                <LogOutIcon className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobil üst bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-gradient-to-r from-[#0d1f4d] to-sidebar px-4 py-3 text-white md:hidden">
          <Logo inverted size={32} />
          <form action={signOut}>
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="text-sidebar-foreground hover:bg-white/10 hover:text-white"
            >
              <LogOutIcon className="size-4" /> Çıkış
            </Button>
          </form>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-24 md:px-8 md:pt-10 md:pb-10">
          {children}
        </main>
      </div>

      <BottomNav role={profile.role} badges={badges} />
    </div>
  );
}
