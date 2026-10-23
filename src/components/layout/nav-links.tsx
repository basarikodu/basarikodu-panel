"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import type { UserRole } from "@/lib/auth";
import { NAV, type NavItem } from "./nav-config";

export type NavBadges = Partial<Record<NonNullable<NavItem["badgeKey"]>, number>>;

function isActive(pathname: string, href: string, rootHref: string) {
  return href === rootHref
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarNav({ role, badges }: { role: UserRole; badges?: NavBadges }) {
  const items = NAV[role];
  const pathname = usePathname();
  const root = items[0].href;
  return (
    <nav className="grid gap-1">
      {items.map(({ href, label, icon: Icon, badgeKey }) => {
        const active = isActive(pathname, href, root);
        const badge = badgeKey ? badges?.[badgeKey] : undefined;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className={cn("size-4.5", active && "text-sidebar-ring")} />
            <span className="flex-1">{label}</span>
            {badge ? (
              <span className="rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-white tabular-nums">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ role, badges }: { role: UserRole; badges?: NavBadges }) {
  const items = NAV[role];
  const pathname = usePathname();
  const root = items[0].href;
  const mobileItems = items.filter((i) => i.mobile);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${mobileItems.length}, minmax(0, 1fr))` }}
      >
        {mobileItems.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = isActive(pathname, href, root);
          const badge = badgeKey ? badges?.[badgeKey] : undefined;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="truncate">{label}</span>
                {badge ? (
                  <span className="absolute top-1 right-[calc(50%-18px)] grid min-w-4 place-items-center rounded-full bg-warning px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
