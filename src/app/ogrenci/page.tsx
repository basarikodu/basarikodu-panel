import { BookOpenCheckIcon, CalendarCheckIcon, TicketIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import { WeekNav } from "@/components/calendar/week-nav";
import { NextLessonCard } from "@/components/lessons/next-lesson-card";
import { StudentCalendar } from "@/components/lessons/student-calendar";
import { CreditSummary } from "@/components/shared/credit-summary";
import { HeroStats, SectionLabel } from "@/components/shared/hero-stats";
import { Card, CardContent } from "@/components/ui/card";
import { isDateKey, toDateKey, weekStartOf } from "@/features/lessons/rules";
import { getStudentOverview, getStudentWeek } from "@/features/lessons/student-queries";
import { requireRole } from "@/lib/auth";
import { formatLongDate, formatMonthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Takvim" };

export default async function StudentHomePage({ searchParams }: PageProps<"/ogrenci">) {
  const profile = await requireRole("student");
  const { hafta } = await searchParams;
  const now = new Date();
  const today = toDateKey(now);
  const currentWeek = weekStartOf(today);
  const weekStart = isDateKey(hafta) ? weekStartOf(hafta) : currentWeek;

  const [overview, lessons] = await Promise.all([
    getStudentOverview(profile.id, now),
    getStudentWeek(profile.id, weekStart),
  ]);
  const remaining = overview.credit?.total_credits ? overview.credit.remaining : null;
  const firstName = profile.fullName
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(" ")[0];

  return (
    <>
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-tight">
          Merhaba, {firstName}
        </h1>
        <p className="mt-1.5 text-muted-foreground">{formatLongDate(now)}</p>
      </div>

      <HeroStats
        stats={[
          {
            label: "Kalan ders hakkı",
            value: remaining ?? "—",
            icon: TicketIcon,
            highlight: remaining !== null && remaining <= 2,
          },
          {
            label: `${formatMonthKey(overview.month).split(" ")[0]} ayında yapılan`,
            value: overview.monthCompleted,
            icon: CalendarCheckIcon,
          },
          {
            label: "Toplam ders",
            value: overview.totalCompleted,
            icon: BookOpenCheckIcon,
            href: "/ogrenci/dersler",
          },
          { label: "Eğitmenim", value: overview.tutorCount, icon: UsersIcon },
        ]}
      />

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <NextLessonCard lesson={overview.next} />
        <Card>
          <CardContent className="grid gap-3">
            <SectionLabel className="mb-0">Ders hakkım</SectionLabel>
            <CreditSummary
              row={overview.credit}
              monthLabel={formatMonthKey(overview.month)}
              audience="student"
            />
            <p className="text-xs text-muted-foreground">
              Hak yalnızca tamamlanan derslerde düşer. Gelemediğin dersler ertelenir, hakkın yanmaz.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <SectionLabel>Haftalık takvim</SectionLabel>
        <div className="mb-4">
          <WeekNav basePath="/ogrenci" weekStart={weekStart} currentWeek={currentWeek} />
        </div>
        <StudentCalendar weekStart={weekStart} today={today} lessons={lessons} />
      </div>
    </>
  );
}
