import type { Metadata } from "next";
import { WeekNav } from "@/components/calendar/week-nav";
import { WeekPlanner } from "@/components/lessons/week-planner";
import { PageHeader } from "@/components/shared/page-header";
import { getTutorPlanningContext, getWeekLessons } from "@/features/lessons/queries";
import { isDateKey, toDateKey, weekStartOf } from "@/features/lessons/rules";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Ders Ekle" };

export default async function TutorAddLessonPage({
  searchParams,
}: PageProps<"/egitmen/ders-ekle">) {
  const profile = await requireRole("tutor");
  const { hafta } = await searchParams;
  const today = toDateKey(new Date());
  const currentWeek = weekStartOf(today);
  const weekStart = isDateKey(hafta) ? weekStartOf(hafta) : currentWeek;

  const [lessons, context] = await Promise.all([
    getWeekLessons(weekStart, { tutorId: profile.id }),
    getTutorPlanningContext(profile.id),
  ]);

  return (
    <>
      <PageHeader
        title="Ders Ekle"
        description="Haftanın gününü seçin, saati ve dersi belirleyip ekleyin. Dersler kurucu onayından sonra takvimde ve öğrencide görünür."
      />
      <WeekPlanner
        key={weekStart}
        weekStart={weekStart}
        today={today}
        lessons={lessons}
        context={context}
        nav={
          <WeekNav basePath="/egitmen/ders-ekle" weekStart={weekStart} currentWeek={currentWeek} />
        }
      />
    </>
  );
}
