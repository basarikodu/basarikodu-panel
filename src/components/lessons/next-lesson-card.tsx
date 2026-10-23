import { CalendarClockIcon, ExternalLinkIcon, UserIcon } from "lucide-react";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CalendarLesson } from "@/features/lessons/types";
import { formatDate, formatTime, formatWeekday } from "@/lib/format";

/** Sıradaki ders: tarih, eğitmen ve "Derse katıl" düğmesi */
export function NextLessonCard({ lesson }: { lesson: CalendarLesson | null }) {
  if (!lesson) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <CalendarClockIcon className="size-6" />
          </span>
          <p className="font-semibold">Planlanmış dersin yok</p>
          <p className="text-sm text-muted-foreground">
            Eğitmenin ders planladığında burada görünecek.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden border-0 bg-gradient-to-br from-[#e9f6e5] to-card ring-1 ring-success/20">
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-[0.18em] text-success uppercase">
            Sıradaki ders
          </p>
          <SubjectChip name={lesson.subjectName} color={lesson.color} />
        </div>
        <div>
          <p className="font-heading text-3xl font-extrabold tabular-nums">
            {formatTime(lesson.startsAt)}
          </p>
          <p className="text-muted-foreground">
            {formatDate(lesson.startsAt)} {formatWeekday(lesson.startsAt)} ·{" "}
            {formatTime(lesson.startsAt)}–{formatTime(lesson.endsAt)}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-medium">
            <UserIcon className="size-4 text-muted-foreground" /> {lesson.tutorName}
          </p>
        </div>
        <div className="mt-auto">
          {lesson.meetingUrl ? (
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-success hover:bg-success/90"
            >
              <a href={lesson.meetingUrl} target="_blank" rel="noreferrer">
                <ExternalLinkIcon className="size-4" /> Derse katıl
              </a>
            </Button>
          ) : (
            <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">
              Ders linki eğitmenin tarafından paylaşılacak.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
