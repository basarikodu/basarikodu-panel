"use client";

import { useState } from "react";
import { cn } from "cn";
import { lessonTone } from "@/components/calendar/week-calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanningContext } from "@/features/lessons/queries";
import {
  addDays,
  istanbulToUtc,
  toDateKey,
  toTimeValue,
  type DateKey,
} from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { LESSON_STATUS_LABELS } from "@/lib/constants";
import { formatLongDate, formatTime } from "@/lib/format";
import { LessonDetailDialog } from "./lesson-detail-dialog";
import { PlanLessonForm } from "./plan-lesson-dialog";

const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

/** Eğitmenin haftalık ders ekleme ekranı: 7 gün düğmesi → gün seç → saat + ders → ekle */
export function WeekPlanner({
  weekStart,
  today,
  lessons,
  context,
  nav,
}: {
  weekStart: DateKey;
  today: DateKey;
  lessons: CalendarLesson[];
  context: PlanningContext;
  nav: React.ReactNode;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const firstOpen = days.find((d) => d >= today) ?? null;
  const [day, setDay] = useState<DateKey | null>(firstOpen);
  const [formKey, setFormKey] = useState(0);
  const [selected, setSelected] = useState<CalendarLesson | null>(null);

  const byDay = new Map<DateKey, CalendarLesson[]>();
  for (const l of lessons) {
    const key = toDateKey(new Date(l.startsAt));
    byDay.set(key, [...(byDay.get(key) ?? []), l]);
  }
  const dayLessons = (day ? (byDay.get(day) ?? []) : []).sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  // Arka arkaya ders kolaylığı: önerilen saat, o günün son dersinin bitişi
  const active = dayLessons.filter((l) => l.displayStatus !== "rejected");
  const suggestedTime = active.length ? toTimeValue(new Date(active.at(-1)!.endsAt)) : "19:00";

  return (
    <>
      <div className="mb-4">{nav}</div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const past = d < today;
          const count = (byDay.get(d) ?? []).filter((l) => l.displayStatus !== "rejected").length;
          return (
            <button
              key={d}
              type="button"
              disabled={past}
              onClick={() => setDay(d)}
              aria-pressed={day === d}
              className={cn(
                "flex flex-col items-center rounded-2xl border py-2.5 text-xs transition sm:py-3.5",
                day === d
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : "bg-card text-muted-foreground hover:border-primary/40",
                past && "cursor-not-allowed opacity-40 hover:border-border",
              )}
            >
              <span className="font-medium">{DAY_NAMES[i]}</span>
              <span
                className={cn(
                  "font-heading text-lg font-bold sm:text-2xl",
                  day !== d && d === today && "text-primary",
                )}
              >
                {Number(d.slice(8, 10))}
              </span>
              <span className="mt-0.5 text-[10px] sm:text-xs">{count ? `${count} ders` : " "}</span>
            </button>
          );
        })}
      </div>

      {day === null ? (
        <div className="mt-6 rounded-[22px] border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
          Bu haftanın günleri geçti. Ders eklemek için sonraki haftaya geçin.
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="text-base">O günün dersleri</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {dayLessons.length === 0 && (
                <p className="rounded-[18px] border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Bu güne henüz ders eklenmedi.
                </p>
              )}
              {dayLessons.map((l) => {
                const tone = lessonTone(l);
                const Icon = tone.icon;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelected(l)}
                    className={cn(
                      "flex items-center gap-3 rounded-[18px] border border-l-4 p-3 text-left shadow-sm",
                      tone.className,
                    )}
                    style={{ borderLeftColor: l.color }}
                  >
                    <div className="w-12 shrink-0 text-center">
                      <p className="font-heading font-bold tabular-nums">
                        {formatTime(l.startsAt)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{formatTime(l.endsAt)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate font-semibold">
                        {Icon && <Icon className="size-3.5 shrink-0" />}
                        {l.studentName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.subjectName} · {LESSON_STATUS_LABELS[l.displayStatus]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="text-base">
                {formatLongDate(istanbulToUtc(day, "12:00"))} · ders ekle
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Saati ve dersi seçin; ders kurucu onayına gider.
              </p>
            </CardHeader>
            <CardContent>
              <PlanLessonForm
                key={`${day}-${formKey}-${suggestedTime}`}
                context={context}
                date={day}
                time={suggestedTime}
                fixedDate
                onSuccess={() => setFormKey((k) => k + 1)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <LessonDetailDialog
        lesson={selected}
        onOpenChange={(o) => !o && setSelected(null)}
        mode="tutor"
      />
    </>
  );
}
