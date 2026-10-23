"use client";

import { CalendarPlusIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import { Button } from "@/components/ui/button";
import type { DateKey } from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { LessonDetailDialog } from "./lesson-detail-dialog";

/** Eğitmen takvimi (görüntüleme): derse tıkla → detay/işlemler. Ders ekleme "Ders Ekle" sekmesinde. */
export function TutorCalendar({
  weekStart,
  today,
  currentWeek,
  lessons,
  nav,
}: {
  weekStart: DateKey;
  today: DateKey;
  currentWeek: DateKey;
  lessons: CalendarLesson[];
  nav: React.ReactNode;
}) {
  const [selected, setSelected] = useState<CalendarLesson | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {nav}
        <Button asChild className="rounded-full">
          <Link
            href={
              weekStart === currentWeek
                ? "/egitmen/ders-ekle"
                : `/egitmen/ders-ekle?hafta=${weekStart}`
            }
          >
            <CalendarPlusIcon className="size-4" /> Ders ekle
          </Link>
        </Button>
      </div>

      <WeekCalendar
        key={weekStart}
        weekStart={weekStart}
        today={today}
        lessons={lessons}
        onLessonClick={setSelected}
      />

      <LessonDetailDialog
        lesson={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mode="tutor"
      />
    </>
  );
}
