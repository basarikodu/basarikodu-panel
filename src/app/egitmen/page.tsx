import {
  CalendarCheckIcon,
  ClipboardCheckIcon,
  GraduationCapIcon,
  HourglassIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { WeekNav } from "@/components/calendar/week-nav";
import { MissingResults } from "@/components/lessons/missing-results";
import { TutorCalendar } from "@/components/lessons/tutor-calendar";
import { HeroStats, SectionLabel } from "@/components/shared/hero-stats";
import {
  getMissingResults,
  getTutorPlanningContext,
  getTutorStats,
  getWeekLessons,
} from "@/features/lessons/queries";
import { isDateKey, toDateKey, weekStartOf } from "@/features/lessons/rules";
import { requireRole } from "@/lib/auth";
import { formatLongDate } from "@/lib/format";

export const metadata: Metadata = { title: "Takvim" };

export default async function TutorHomePage({ searchParams }: PageProps<"/egitmen">) {
  const profile = await requireRole("tutor");
  const { hafta } = await searchParams;
  const now = new Date();
  const today = toDateKey(now);
  const currentWeek = weekStartOf(today);
  const weekStart = isDateKey(hafta) ? weekStartOf(hafta) : currentWeek;

  const [lessons, context, stats, missing] = await Promise.all([
    getWeekLessons(weekStart, { tutorId: profile.id }),
    getTutorPlanningContext(profile.id),
    getTutorStats(profile.id, now),
    getMissingResults(profile.id),
  ]);
  const studentCount = new Set(context.assignments.map((a) => a.studentId)).size;
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
          { label: "Bugünkü ders", value: stats.today, icon: CalendarCheckIcon },
          {
            label: "Onay bekleyen",
            value: stats.pending,
            icon: HourglassIcon,
            highlight: stats.pending > 0,
          },
          {
            label: "Sonucu girilmemiş",
            value: stats.missingResults,
            icon: ClipboardCheckIcon,
            highlight: stats.missingResults > 0,
          },
          {
            label: "Öğrencim",
            value: studentCount,
            icon: GraduationCapIcon,
            href: "/egitmen/ogrencilerim",
          },
        ]}
      />

      {missing.length > 0 && (
        <div className="mt-8">
          <SectionLabel>Sonucunu girmen gereken dersler</SectionLabel>
          <MissingResults lessons={missing} />
        </div>
      )}

      <div className="mt-8">
        <SectionLabel>Haftalık takvim</SectionLabel>
        <TutorCalendar
          weekStart={weekStart}
          today={today}
          lessons={lessons}
          context={context}
          nav={<WeekNav basePath="/egitmen" weekStart={weekStart} currentWeek={currentWeek} />}
        />
      </div>
    </>
  );
}
