"use client";

import { ClipboardCheckIcon } from "lucide-react";
import { useState } from "react";
import { SubjectChip } from "@/components/shared/subject-chip";
import type { CalendarLesson } from "@/features/lessons/types";
import { formatDate, formatTime } from "@/lib/format";
import { LessonDetailDialog } from "./lesson-detail-dialog";

/** Geçmiş ama sonucu girilmemiş dersler; tıklayınca sonuç formu açılır */
export function MissingResults({ lessons }: { lessons: CalendarLesson[] }) {
  const [selected, setSelected] = useState<CalendarLesson | null>(null);
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelected(l)}
            className="flex items-center gap-3 rounded-[18px] border border-warning/40 bg-warning-soft/60 p-3 text-left transition hover:bg-warning-soft"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-warning">
              <ClipboardCheckIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.studentName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(l.startsAt)} · {formatTime(l.startsAt)}
              </p>
            </div>
            <SubjectChip name={l.subjectName} color={l.color} />
          </button>
        ))}
      </div>
      <LessonDetailDialog
        lesson={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mode="tutor"
      />
    </>
  );
}
