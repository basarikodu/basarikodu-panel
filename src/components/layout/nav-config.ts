import {
  BookOpenIcon,
  CalendarDaysIcon,
  CircleUserIcon,
  GraduationCapIcon,
  HourglassIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/auth";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Alt menüde (mobil) gösterilsin mi */
  mobile?: boolean;
  badgeKey?: "pendingApprovals";
};

export const NAV: Record<UserRole, NavItem[]> = {
  founder: [
    { href: "/kurucu", label: "Genel Bakış", icon: LayoutDashboardIcon, mobile: true },
    {
      href: "/kurucu/onaylar",
      label: "Onay Bekleyenler",
      icon: HourglassIcon,
      mobile: true,
      badgeKey: "pendingApprovals",
    },
    { href: "/kurucu/dersler", label: "Dersler", icon: CalendarDaysIcon, mobile: true },
    { href: "/kurucu/ogrenciler", label: "Öğrenciler", icon: GraduationCapIcon, mobile: true },
    { href: "/kurucu/egitmenler", label: "Eğitmenler", icon: UsersIcon },
    { href: "/kurucu/finans", label: "Gelir-Gider", icon: WalletIcon, mobile: true },
    { href: "/kurucu/ayarlar", label: "Ayarlar", icon: SettingsIcon },
  ],
  tutor: [
    { href: "/egitmen", label: "Takvim", icon: CalendarDaysIcon, mobile: true },
    { href: "/egitmen/ogrencilerim", label: "Öğrencilerim", icon: GraduationCapIcon, mobile: true },
    { href: "/egitmen/profil", label: "Profil", icon: CircleUserIcon, mobile: true },
  ],
  student: [
    { href: "/ogrenci", label: "Takvim", icon: CalendarDaysIcon, mobile: true },
    { href: "/ogrenci/dersler", label: "Derslerim", icon: BookOpenIcon, mobile: true },
    { href: "/ogrenci/profil", label: "Profil", icon: CircleUserIcon, mobile: true },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  founder: "Kurucu",
  tutor: "Eğitmen",
  student: "Öğrenci / Veli",
};
