"use client";

import {
  CalendarClockIcon,
  CheckIcon,
  HourglassIcon,
  PlusIcon,
  UserXIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "cn";
import { addDays, istanbulToUtc, toDateKey, type DateKey } from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { formatTime } from "@/lib/format";

const START_HOUR = 8;
const END_HOUR = 24;
const HOUR_PX = 60;
const DAY_NAMES = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type Props = {
  weekStart: DateKey;
  today: DateKey;
  lessons: CalendarLesson[];
  /** Boş saate tıklanınca (ör. ders planla) */
  onSlotClick?: (date: DateKey, time: string) => void;
  onLessonClick: (lesson: CalendarLesson) => void;
  /** Kartta öğrenci yerine eğitmen adını göster (öğrenci paneli) */
  showTutor?: boolean;
};

// Şu anki dakika (yalnızca istemcide; sunucuda null → hidrasyon uyumsuzluğu olmaz)
function subscribeMinute(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => null;

function dayNumber(date: DateKey) {
  return Number(date.slice(8, 10));
}

/** Aynı gün çakışan dersleri yan yana dizmek için şerit ataması */
function layoutDay(lessons: CalendarLesson[]) {
  const sorted = [...lessons].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const laneEnds: number[] = [];
  const placed = sorted.map((l) => {
    const start = Date.parse(l.startsAt);
    let lane = laneEnds.findIndex((end) => end <= start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = Date.parse(l.endsAt);
    return { lesson: l, lane };
  });
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

export function lessonTone(l: CalendarLesson) {
  switch (l.displayStatus) {
    case "pending_approval":
      return { className: "border-dashed border-warning bg-warning-soft/80", icon: HourglassIcon };
    case "rejected":
      return {
        className: "border-dashed border-destructive/50 bg-destructive/5 opacity-70 line-through",
        icon: XIcon,
      };
    case "completed":
      return { className: "bg-success-soft/70", icon: CheckIcon };
    case "no_show":
      return { className: "bg-warning-soft/70", icon: UserXIcon };
    case "cancelled_by_student":
    case "cancelled_by_tutor":
      return { className: "bg-muted opacity-60 line-through", icon: XIcon };
    case "postponed":
      return { className: "bg-muted opacity-70", icon: CalendarClockIcon };
    default:
      return { className: "bg-card", icon: null };
  }
}

export function WeekCalendar({
  weekStart,
  today,
  lessons,
  onSlotClick,
  onLessonClick,
  showTutor,
}: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const byDay = new Map<DateKey, CalendarLesson[]>(days.map((d) => [d, []]));
  for (const l of lessons) byDay.get(toDateKey(new Date(l.startsAt)))?.push(l);

  const initialDay = days.includes(today) ? today : days[0];
  const [mobileDay, setMobileDay] = useState<DateKey>(initialDay);
  const nowMinute = useSyncExternalStore(subscribeMinute, currentMinute, serverMinute);

  // Izgara açılınca haftanın ilk dersinin bir saat öncesine (ders yoksa 15:00'e) kaydır
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstHour = lessons.length
    ? Math.min(...lessons.map((l) => Number(formatTime(l.startsAt).slice(0, 2))))
    : 16;
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = Math.max(0, (firstHour - 1 - START_HOUR) * HOUR_PX);
  }, [firstHour]);

  return (
    <>
      {/* Masaüstü: saat ızgarası */}
      <div className="hidden overflow-hidden rounded-[26px] border border-border/80 bg-card shadow-card md:block">
        <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b bg-linear-to-b from-secondary/60 to-card">
          <div />
          {days.map((d, i) => (
            <div
              key={d}
              className={cn("border-l px-3 py-3 text-center", d === today && "bg-accent/70")}
            >
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {DAY_NAMES[i]}
              </p>
              <p
                className={cn(
                  "mx-auto mt-1 grid size-9 place-items-center rounded-full font-heading text-lg font-bold",
                  d === today &&
                    "bg-primary text-primary-foreground shadow-[0_6px_14px_-6px_rgb(11_52_120/0.6)]",
                )}
              >
                {dayNumber(d)}
              </p>
            </div>
          ))}
        </div>

        <div ref={scrollRef} className="max-h-[68vh] overflow-y-auto">
          <div
            className="relative grid grid-cols-[64px_repeat(7,minmax(0,1fr))]"
            style={{ height: (END_HOUR - START_HOUR) * HOUR_PX }}
          >
            {/* Saat etiketleri */}
            <div className="relative">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <span
                  key={i}
                  className="absolute right-2 -translate-y-1/2 text-xs text-muted-foreground tabular-nums"
                  style={{ top: i * HOUR_PX }}
                >
                  {i === 0 ? "" : `${String(START_HOUR + i).padStart(2, "0")}:00`}
                </span>
              ))}
            </div>

            {days.map((d) => {
              const { placed, lanes } = layoutDay(byDay.get(d) ?? []);
              const dayStart = istanbulToUtc(d).getTime();
              return (
                <div key={d} className={cn("relative border-l", d === today && "bg-accent/25")}>
                  {Array.from({ length: (END_HOUR - START_HOUR) * 2 }, (_, i) => {
                    const minutes = START_HOUR * 60 + i * 30;
                    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${minutes % 60 === 0 ? "00" : "30"}`;
                    return onSlotClick ? (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${d} ${time} ders planla`}
                        onClick={() => onSlotClick(d, time)}
                        className={cn(
                          "group absolute inset-x-0 flex items-center justify-center hover:bg-primary/5",
                          i % 2 === 0
                            ? "border-t border-border/70"
                            : "border-t border-dashed border-border/40",
                        )}
                        style={{ top: (i * HOUR_PX) / 2, height: HOUR_PX / 2 }}
                      >
                        <PlusIcon className="size-3.5 text-primary opacity-0 group-hover:opacity-60" />
                      </button>
                    ) : (
                      <div
                        key={i}
                        className={cn(
                          "absolute inset-x-0",
                          i % 2 === 0
                            ? "border-t border-border/70"
                            : "border-t border-dashed border-border/40",
                        )}
                        style={{ top: (i * HOUR_PX) / 2, height: HOUR_PX / 2 }}
                      />
                    );
                  })}

                  {d === today &&
                    nowMinute !== null &&
                    (() => {
                      const top =
                        ((nowMinute * 60_000 - dayStart) / 3_600_000 - START_HOUR) * HOUR_PX;
                      return top > 0 && top < (END_HOUR - START_HOUR) * HOUR_PX ? (
                        <div
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 z-30 h-0.5 bg-destructive/80"
                          style={{ top }}
                        >
                          <span className="absolute -top-[3px] -left-[4px] size-2 rounded-full bg-destructive" />
                        </div>
                      ) : null;
                    })()}

                  {placed.map(({ lesson: l, lane }) => {
                    const startMin = (Date.parse(l.startsAt) - dayStart) / 60_000;
                    const endMin = (Date.parse(l.endsAt) - dayStart) / 60_000;
                    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_PX;
                    const height = Math.max(((endMin - startMin) / 60) * HOUR_PX - 3, 26);
                    const tone = lessonTone(l);
                    const Icon = tone.icon;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => onLessonClick(l)}
                        className={cn(
                          "absolute z-10 overflow-hidden rounded-xl border border-l-4 px-2 py-1.5 text-left text-xs shadow-sm transition hover:z-20 hover:-translate-y-px hover:shadow-card-hover",
                          tone.className,
                        )}
                        style={{
                          top: Math.max(top, 0) + 1,
                          height,
                          left: `calc(${(lane / lanes) * 100}% + 3px)`,
                          width: `calc(${100 / lanes}% - 6px)`,
                          borderLeftColor: l.color,
                          ...(l.displayStatus === "planned" && {
                            backgroundColor: `color-mix(in srgb, ${l.color} 9%, white)`,
                            borderColor: `color-mix(in srgb, ${l.color} 22%, white)`,
                            borderLeftColor: l.color,
                          }),
                        }}
                      >
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          {Icon && <Icon className="size-3 shrink-0" />}
                          <span className="truncate">
                            {showTutor ? l.subjectName : l.studentName}
                          </span>
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {formatTime(l.startsAt)} · {showTutor ? l.tutorName : l.subjectName}
                        </span>
                        {l.pendingChange && (
                          <span className="mt-0.5 inline-block rounded bg-warning px-1 text-[10px] font-semibold text-white no-underline">
                            Değişiklik onayda
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobil: gün seçici + liste */}
      <div className="md:hidden">
        <div className="mb-3 grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const count = byDay.get(d)?.length ?? 0;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setMobileDay(d)}
                className={cn(
                  "flex flex-col items-center rounded-2xl py-2 text-xs transition",
                  mobileDay === d
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-card text-muted-foreground",
                )}
              >
                <span className="font-medium">{DAY_NAMES[i]}</span>
                <span
                  className={cn(
                    "font-heading text-base font-bold",
                    mobileDay !== d && d === today && "text-primary",
                  )}
                >
                  {dayNumber(d)}
                </span>
                <span
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full",
                    count ? (mobileDay === d ? "bg-white" : "bg-success") : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>

        <div className="grid gap-2">
          {(byDay.get(mobileDay) ?? []).length === 0 && (
            <div className="rounded-[22px] border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
              Bu gün ders yok.
            </div>
          )}
          {(byDay.get(mobileDay) ?? [])
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
            .map((l) => {
              const tone = lessonTone(l);
              const Icon = tone.icon;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onLessonClick(l)}
                  className={cn(
                    "flex items-center gap-3 rounded-[18px] border border-l-4 p-3 text-left shadow-sm",
                    tone.className,
                  )}
                  style={{ borderLeftColor: l.color }}
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="font-heading font-bold tabular-nums">{formatTime(l.startsAt)}</p>
                    <p className="text-[11px] text-muted-foreground">{formatTime(l.endsAt)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate font-semibold">
                      {Icon && <Icon className="size-3.5 shrink-0" />}
                      {showTutor ? l.subjectName : l.studentName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {showTutor ? l.tutorName : l.subjectName}
                      {l.pendingChange && " · değişiklik onayda"}
                    </p>
                  </div>
                </button>
              );
            })}
          {onSlotClick && (
            <button
              type="button"
              onClick={() => onSlotClick(mobileDay, "19:00")}
              className="flex items-center justify-center gap-2 rounded-[18px] border border-dashed bg-card p-3 text-sm font-semibold text-primary"
            >
              <PlusIcon className="size-4" /> Bu güne ders planla
            </button>
          )}
        </div>
      </div>
    </>
  );
}
