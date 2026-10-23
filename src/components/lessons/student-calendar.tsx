"use client";

import { useState } from "react";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import type { DateKey } from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { LessonDetailDialog } from "./lesson-detail-dialog";

/** Öğrenci/veli takvimi: salt okunur, derse tıklayınca detay ve "Derse katıl" */
export function StudentCalendar({
  weekStart,
  today,
  lessons,
}: {
  weekStart: DateKey;
  today: DateKey;
  lessons: CalendarLesson[];
}) {
  const [selected, setSelected] = useState<CalendarLesson | null>(null);
  return (
    <>
      <WeekCalendar
        key={weekStart}
        weekStart={weekStart}
        today={today}
        lessons={lessons}
        onLessonClick={setSelected}
        showTutor
      />
      <LessonDetailDialog
        lesson={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mode="student"
      />
    </>
  );
}
