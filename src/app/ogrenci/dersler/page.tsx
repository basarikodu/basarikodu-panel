import { BookOpenIcon, MessageSquareTextIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionLabel } from "@/components/shared/hero-stats";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentHistory } from "@/features/lessons/student-queries";
import type { CalendarLesson } from "@/features/lessons/types";
import { getCreditBalances } from "@/features/users/queries";
import { requireRole } from "@/lib/auth";
import { LESSON_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatMonthKey, formatTime, formatWeekday, toMonthKey } from "@/lib/format";

export const metadata: Metadata = { title: "Derslerim" };

export default async function StudentLessonsPage() {
  const profile = await requireRole("student");
  const [history, credits] = await Promise.all([
    getStudentHistory(profile.id),
    getCreditBalances(),
  ]);
  const credit = credits.get(profile.id);
  const totalCompleted = history.months.reduce((s, m) => s + m.completed, 0);
  const current = history.months.find((m) => m.month === toMonthKey());
  const thisMonth = current?.completed ?? 0;

  return (
    <>
      <PageHeader
        title="Derslerim"
        description={`Toplam ${totalCompleted} ders · Bu ay ${thisMonth} ders${
          credit?.total_credits ? ` · Kalan hak ${credit.remaining}` : ""
        }`}
      />

      {history.lessons.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="Henüz dersin yok"
          description="Eğitmenin ders planladığında derslerin burada listelenecek."
        />
      ) : (
        <div className="grid gap-8">
          {history.upcoming.length > 0 && (
            <section>
              <SectionLabel>Yaklaşan dersler</SectionLabel>
              <div className="grid gap-2 md:grid-cols-2">
                {history.upcoming.slice(0, 6).map((l) => (
                  <LessonCard key={l.id} lesson={l} />
                ))}
              </div>
            </section>
          )}

          {history.months.length > 0 && (
            <section>
              <SectionLabel>Ay ay özet</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {history.months.map((m) => {
                  const pct = m.packageLessons
                    ? Math.min(100, Math.round((m.completed / m.packageLessons) * 100))
                    : 0;
                  return (
                    <Card key={m.month}>
                      <CardContent className="grid gap-3">
                        <div className="flex items-baseline justify-between">
                          <p className="font-heading text-lg font-bold">
                            {formatMonthKey(m.month)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {m.packageLessons ? `${m.packageLessons} derslik paket` : "Paket yok"}
                          </p>
                        </div>
                        <p className="font-heading text-3xl font-extrabold text-primary tabular-nums">
                          {m.completed}
                          <span className="text-base font-semibold text-muted-foreground">
                            {m.packageLessons ? ` / ${m.packageLessons}` : ""} ders
                          </span>
                        </p>
                        {m.packageLessons ? (
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-success"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        ) : null}
                        <div className="flex flex-wrap gap-1.5">
                          {m.bySubject.map((s) => (
                            <span key={s.name} className="inline-flex items-center gap-1">
                              <SubjectChip name={s.name} color={s.color} />
                              <span className="text-xs text-muted-foreground">×{s.count}</span>
                            </span>
                          ))}
                          {m.noShow > 0 && (
                            <span className="text-xs text-warning">
                              {m.noShow} ders katılınmadı
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <SectionLabel>Geçmiş dersler</SectionLabel>
            {history.past.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henüz tamamlanan ders yok.</p>
            ) : (
              <div className="grid gap-2">
                {history.past.map((l) => (
                  <LessonCard key={l.id} lesson={l} showNote />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function LessonCard({
  lesson: l,
  showNote = false,
}: {
  lesson: CalendarLesson;
  showNote?: boolean;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-11 w-1 shrink-0 rounded-full" style={{ background: l.color }} />
          <div className="min-w-0">
            <p className="font-semibold">
              {formatDate(l.startsAt)}{" "}
              <span className="font-normal text-muted-foreground">
                {formatWeekday(l.startsAt)} · {formatTime(l.startsAt)}
              </span>
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {l.subjectName} · {l.tutorName} · {LESSON_TYPE_LABELS[l.lessonType]}
            </p>
          </div>
        </div>
        <StatusBadge status={l.displayStatus} className="self-start sm:self-center" />
      </CardContent>
      {showNote && l.topic && (
        <div className="mx-4 mb-4 flex gap-2 rounded-xl bg-muted/70 p-3 text-sm">
          <MessageSquareTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="whitespace-pre-line">{l.topic}</p>
        </div>
      )}
    </Card>
  );
}
