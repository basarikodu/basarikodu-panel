import { ArrowRightIcon, CalendarPlusIcon, CheckIcon, PartyPopperIcon, XIcon } from "lucide-react";
import type { Metadata } from "next";
import { ActionButton } from "@/components/shared/action-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextAreaField } from "@/components/shared/form-fields";
import { SectionLabel } from "@/components/shared/hero-stats";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  approveChangeRequest,
  approveLessons,
  rejectChangeRequest,
  rejectLessons,
} from "@/features/lessons/actions";
import { getPendingApprovals } from "@/features/lessons/queries";
import type { CalendarLesson } from "@/features/lessons/types";
import { LESSON_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, formatTime, formatWeekday } from "@/lib/format";

export const metadata: Metadata = { title: "Onay Bekleyenler" };

export default async function ApprovalsPage() {
  const { lessonGroups, changeRequests } = await getPendingApprovals();
  const total = lessonGroups.length + changeRequests.length;

  return (
    <>
      <PageHeader
        title="Onay Bekleyenler"
        description="Eğitmenlerin yeni ders, erteleme ve iptal talepleri. Üç kurucudan birinin onayı yeterlidir."
      />

      {total === 0 && (
        <EmptyState
          icon={PartyPopperIcon}
          title="Bekleyen talep yok"
          description="Eğitmenler ders planladığında veya erteleme istediğinde burada görünür."
        />
      )}

      {lessonGroups.length > 0 && (
        <section className="mb-8">
          <SectionLabel>Yeni ders talepleri ({lessonGroups.length})</SectionLabel>
          <div className="grid gap-3 lg:grid-cols-2">
            {lessonGroups.map((group) => (
              <LessonGroupCard key={group[0].seriesId ?? group[0].id} group={group} />
            ))}
          </div>
        </section>
      )}

      {changeRequests.length > 0 && (
        <section>
          <SectionLabel>Erteleme ve iptal talepleri ({changeRequests.length})</SectionLabel>
          <div className="grid gap-3 lg:grid-cols-2">
            {changeRequests.map((r) => (
              <Card key={r.id}>
                <CardContent className="grid gap-3">
                  <Header lesson={r.lesson} />
                  <div className="rounded-xl bg-muted/70 p-3 text-sm">
                    {r.type === "reschedule" && r.newStartsAt ? (
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        <Badge variant="secondary">Erteleme</Badge>
                        <span className="line-through opacity-60">
                          {formatDateTime(r.lesson.startsAt)}
                        </span>
                        <ArrowRightIcon className="size-4" />
                        <span>
                          {formatDate(r.newStartsAt)} {formatWeekday(r.newStartsAt)} ·{" "}
                          {formatTime(r.newStartsAt)}
                        </span>
                      </p>
                    ) : (
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        <Badge variant="destructive">İptal</Badge>
                        {formatDateTime(r.lesson.startsAt)} ·{" "}
                        {r.cancelStatus === "cancelled_by_tutor"
                          ? "eğitmen iptal ediyor"
                          : "öğrenci/veli iptal ediyor"}
                      </p>
                    )}
                    {r.reason && <p className="mt-2 text-muted-foreground">“{r.reason}”</p>}
                  </div>
                  <Actions
                    approve={approveChangeRequest.bind(null, r.id)}
                    reject={rejectChangeRequest.bind(null, r.id)}
                    approveLabel={r.type === "reschedule" ? "Ertelemeyi onayla" : "İptali onayla"}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Header({ lesson }: { lesson: CalendarLesson }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-lg font-bold">{lesson.studentName}</p>
        <p className="text-sm text-muted-foreground">
          {lesson.tutorName} · {LESSON_TYPE_LABELS[lesson.lessonType]}
          {lesson.isFree && " · hediye koçluk"}
        </p>
      </div>
      <SubjectChip name={lesson.subjectName} color={lesson.color} />
    </div>
  );
}

function LessonGroupCard({ group }: { group: CalendarLesson[] }) {
  const first = group[0];
  const ids = group.map((l) => l.id);
  return (
    <Card>
      <CardContent className="grid gap-3">
        <Header lesson={first} />
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarPlusIcon className="size-4 text-primary" />
          {group.length > 1
            ? `Her hafta ${formatWeekday(first.startsAt)} ${formatTime(first.startsAt)} · ${group.length} ders`
            : "Tek ders"}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {group.slice(0, 8).map((l) => (
            <span
              key={l.id}
              className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary"
            >
              {formatDate(l.startsAt)} · {formatTime(l.startsAt)}
            </span>
          ))}
          {group.length > 8 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs">+{group.length - 8}</span>
          )}
        </div>
        <Actions
          approve={approveLessons.bind(null, ids)}
          reject={rejectLessons.bind(null, ids)}
          approveLabel={group.length > 1 ? `${group.length} dersi onayla` : "Onayla"}
        />
      </CardContent>
    </Card>
  );
}

function Actions({
  approve,
  reject,
  approveLabel,
}: {
  approve: () => Promise<import("@/lib/action-state").ActionState>;
  reject: import("@/components/shared/form-dialog").FormAction;
  approveLabel: string;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
      <FormDialog
        title="Talebi reddet"
        description="Eğitmen red sebebini görür; ders/takvim değişmez."
        action={reject}
        submitLabel="Reddet"
        trigger={
          <Button variant="outline" size="sm">
            <XIcon className="size-4" /> Reddet
          </Button>
        }
      >
        <TextAreaField
          name="reason"
          label="Red sebebi"
          rows={3}
          required
          placeholder="ör. Bu saatte öğrencinin okul programı var"
        />
      </FormDialog>
      <ActionButton size="sm" action={approve} className="bg-success hover:bg-success/90">
        <CheckIcon className="size-4" /> {approveLabel}
      </ActionButton>
    </div>
  );
}
