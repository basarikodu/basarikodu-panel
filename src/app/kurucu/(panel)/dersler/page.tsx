import type { Metadata } from "next";
import { Suspense } from "react";
import { WeekNav } from "@/components/calendar/week-nav";
import { FounderCalendar } from "@/components/lessons/founder-calendar";
import { SectionLabel } from "@/components/shared/hero-stats";
import { LessonTable } from "@/components/shared/lesson-table";
import { PageHeader } from "@/components/shared/page-header";
import { UrlSelect } from "@/components/shared/url-select";
import { Card } from "@/components/ui/card";
import { getFounderPlanningContext, getWeekLessons } from "@/features/lessons/queries";
import { isDateKey, toDateKey, weekStartOf } from "@/features/lessons/rules";

export const metadata: Metadata = { title: "Dersler" };

const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

export default async function FounderLessonsPage({ searchParams }: PageProps<"/kurucu/dersler">) {
  const sp = await searchParams;
  const today = toDateKey(new Date());
  const currentWeek = weekStartOf(today);
  const weekStart = isDateKey(sp.hafta) ? weekStartOf(sp.hafta) : currentWeek;
  const tutorId = isUuid(sp.egitmen) ? sp.egitmen : undefined;
  const studentId = isUuid(sp.ogrenci) ? sp.ogrenci : undefined;

  const [lessons, { context, tutorOptions, studentOptions }] = await Promise.all([
    getWeekLessons(weekStart, { tutorId, studentId }),
    getFounderPlanningContext(),
  ]);

  const count = (pred: (s: (typeof lessons)[number]) => boolean) => lessons.filter(pred).length;
  const stats = [
    {
      label: "Planlanan",
      value: count((l) => l.status === "planned" && l.approvalStatus === "approved"),
    },
    { label: "Tamamlanan", value: count((l) => l.status === "completed") },
    {
      label: "Gelmedi / iptal",
      value: count((l) =>
        ["no_show", "cancelled_by_student", "cancelled_by_tutor"].includes(l.status),
      ),
    },
    { label: "Onay bekleyen", value: count((l) => l.approvalStatus === "pending") },
  ];
  const basePath = `/kurucu/dersler${tutorId || studentId ? `?${new URLSearchParams({ ...(tutorId && { egitmen: tutorId }), ...(studentId && { ogrenci: studentId }) })}` : ""}`;

  return (
    <>
      <PageHeader
        title="Dersler"
        description="Tüm eğitmenlerin dersleri. Kurucu olarak eklediğiniz ve düzenlediğiniz dersler onay beklemez."
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card px-4 py-3">
            <p className="font-heading text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <FounderCalendar
        weekStart={weekStart}
        today={today}
        lessons={lessons}
        context={context}
        toolbar={
          <div className="flex flex-wrap items-center gap-2">
            <WeekNav basePath={basePath} weekStart={weekStart} currentWeek={currentWeek} />
            <Suspense>
              <UrlSelect
                param="egitmen"
                label="Eğitmen filtresi"
                placeholder="Tüm eğitmenler"
                options={tutorOptions}
              />
              <UrlSelect
                param="ogrenci"
                label="Öğrenci filtresi"
                placeholder="Tüm öğrenciler"
                options={studentOptions}
              />
            </Suspense>
          </div>
        }
      />

      <div className="mt-8">
        <SectionLabel>Bu haftanın ders listesi ({lessons.length})</SectionLabel>
        <Card className="py-0">
          <LessonTable
            personLabel="Öğrenci · Eğitmen"
            lessons={lessons.map((l) => ({
              id: l.id,
              starts_at: l.startsAt,
              ends_at: l.endsAt,
              status: l.status,
              approval_status: l.approvalStatus,
              lesson_type: l.lessonType,
              topic: l.topic,
              is_free: l.isFree,
              subject: { name: l.subjectName, color: l.color },
              person: `${l.studentName} · ${l.tutorName}`,
            }))}
          />
        </Card>
      </div>
    </>
  );
}
