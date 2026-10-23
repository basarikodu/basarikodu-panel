"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { WeekCalendar } from "@/components/calendar/week-calendar";
import { Button } from "@/components/ui/button";
import type { PlanningContext } from "@/features/lessons/queries";
import type { DateKey } from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { LessonDetailDialog } from "./lesson-detail-dialog";
import { PlanLessonDialog } from "./plan-lesson-dialog";

/** Kurucu ders takvimi: tüm dersler, doğrudan ekleme ve düzenleme (onaysız) */
export function FounderCalendar({
  weekStart,
  today,
  lessons,
  context,
  toolbar,
}: {
  weekStart: DateKey;
  today: DateKey;
  lessons: CalendarLesson[];
  context: PlanningContext;
  toolbar: React.ReactNode;
}) {
  const [selected, setSelected] = useState<CalendarLesson | null>(null);
  const [plan, setPlan] = useState<{ date: string; time: string } | null>(null);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {toolbar}
        <Button
          className="rounded-full"
          onClick={() => setPlan({ date: weekStart <= today ? today : weekStart, time: "19:00" })}
        >
          <PlusIcon className="size-4" /> Ders ekle
        </Button>
      </div>
      <WeekCalendar
        key={weekStart}
        weekStart={weekStart}
        today={today}
        lessons={lessons}
        onSlotClick={(date, time) => setPlan({ date, time })}
        onLessonClick={setSelected}
      />
      <PlanLessonDialog
        open={plan !== null}
        onOpenChange={(o) => !o && setPlan(null)}
        context={context}
        prefill={plan ?? { date: today, time: "19:00" }}
        founderMode
      />
      <LessonDetailDialog
        lesson={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mode="founder"
      />
    </>
  );
}
