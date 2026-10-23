import {
  ArrowRightIcon,
  CalendarCheckIcon,
  GraduationCapIcon,
  HourglassIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeroStats, SectionLabel } from "@/components/shared/hero-stats";
import { displayStatus } from "@/components/shared/lesson-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { formatDate, formatLongDate, formatTime, getDayRange } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Genel Bakış" };

const LESSON_SELECT =
  "id, starts_at, ends_at, status, approval_status, lesson_type, topic, created_at, subject:subjects(name, color), tutor:tutors(profile:profiles!inner(full_name)), student:students(profile:profiles!inner(full_name))";

export default async function FounderHomePage() {
  const profile = await requireRole("founder");
  const supabase = await createClient();
  const now = new Date();
  const { start, end } = getDayRange(now);

  const [today, pending, changeCount, students, tutors] = await Promise.all([
    supabase
      .from("lessons")
      .select(LESSON_SELECT)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString())
      .neq("approval_status", "rejected")
      .order("starts_at"),
    supabase
      .from("lessons")
      .select(LESSON_SELECT, { count: "exact" })
      .eq("approval_status", "pending")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("lesson_change_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_active", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "tutor")
      .eq("is_active", true),
  ]);

  const todayLessons = today.data ?? [];
  const pendingTotal = (pending.count ?? 0) + (changeCount.count ?? 0);
  const firstName = profile.fullName
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")[0];

  return (
    <>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-tight">
            Merhaba, {firstName}
          </h1>
          <p className="mt-1.5 text-muted-foreground">{formatLongDate(now)}</p>
        </div>
        <Button asChild variant="outline" size="lg" className="rounded-full bg-card px-6">
          <Link href="/kurucu/dersler">
            Derslere git <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </div>

      <HeroStats
        stats={[
          {
            label: "Bugünkü ders",
            value: todayLessons.length,
            icon: CalendarCheckIcon,
            href: "/kurucu/dersler",
          },
          {
            label: "Onay bekleyen talep",
            value: pendingTotal,
            icon: HourglassIcon,
            href: "/kurucu/onaylar",
            highlight: pendingTotal > 0,
          },
          {
            label: "Aktif öğrenci",
            value: students.count ?? 0,
            icon: GraduationCapIcon,
            href: "/kurucu/ogrenciler",
          },
          {
            label: "Aktif eğitmen",
            value: tutors.count ?? 0,
            icon: UsersIcon,
            href: "/kurucu/egitmenler",
          },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <SectionLabel>Günün dersleri</SectionLabel>
          <Card className="py-0">
            <CardContent className="p-0">
              {todayLessons.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Bugün planlanmış ders yok.
                </p>
              ) : (
                <ul className="divide-y">
                  {todayLessons.map((l) => (
                    <li key={l.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-14 shrink-0 text-center">
                        <p className="font-heading text-lg font-bold tabular-nums">
                          {formatTime(l.starts_at)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTime(l.ends_at)}</p>
                      </div>
                      <div
                        className="h-10 w-1 shrink-0 rounded-full"
                        style={{ background: l.subject?.color ?? "var(--primary)" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{l.student?.profile.full_name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {l.subject?.name} · {l.tutor?.profile.full_name}
                        </p>
                      </div>
                      <StatusBadge status={displayStatus(l)} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <SectionLabel>Onay bekleyen dersler</SectionLabel>
          <Card className="py-0">
            <CardContent className="p-0">
              {(pending.data ?? []).length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Bekleyen talep yok. 🎉
                </p>
              ) : (
                <ul className="divide-y">
                  {(pending.data ?? []).map((l) => (
                    <li key={l.id} className="flex items-center gap-3 px-5 py-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary">
                        <HourglassIcon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{l.student?.profile.full_name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {formatDate(l.starts_at)} · {formatTime(l.starts_at)} ·{" "}
                          {l.tutor?.profile.full_name}
                        </p>
                      </div>
                      {l.subject && <SubjectChip name={l.subject.name} color={l.subject.color} />}
                    </li>
                  ))}
                </ul>
              )}
              {pendingTotal > 0 && (
                <Link
                  href="/kurucu/onaylar"
                  className="flex items-center justify-center gap-1 border-t px-5 py-3 text-sm font-semibold text-primary hover:bg-muted/50"
                >
                  Tümünü incele <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
