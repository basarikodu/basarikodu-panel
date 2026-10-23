"use client";

import {
  CalendarClockIcon,
  ClockIcon,
  ExternalLinkIcon,
  InfoIcon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { ActionButton } from "@/components/shared/action-button";
import { ActionForm } from "@/components/shared/action-form";
import { SelectField, TextAreaField, TextField } from "@/components/shared/form-fields";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubjectChip } from "@/components/shared/subject-chip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  recordLessonResult,
  requestLessonChange,
  withdrawChangeRequest,
  withdrawLesson,
} from "@/features/lessons/actions";
import {
  canRecordResult,
  canRequestChange,
  canWithdraw,
  toDateKey,
  toTimeValue,
} from "@/features/lessons/rules";
import type { CalendarLesson } from "@/features/lessons/types";
import { LESSON_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatTime, formatWeekday } from "@/lib/format";

type Panel = "none" | "result" | "reschedule" | "cancel";

export function LessonDetailDialog({
  lesson,
  onOpenChange,
  mode,
}: {
  lesson: CalendarLesson | null;
  onOpenChange: (open: boolean) => void;
  mode: "tutor" | "student" | "founder";
}) {
  return (
    <Dialog open={lesson !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {lesson && (
          <LessonDetail
            key={lesson.id}
            lesson={lesson}
            mode={mode}
            close={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function LessonDetail({
  lesson: l,
  mode,
  close,
}: {
  lesson: CalendarLesson;
  mode: "tutor" | "student" | "founder";
  close: () => void;
}) {
  const [now] = useState(() => Date.now());
  const state = { status: l.status, approval_status: l.approvalStatus, starts_at: l.startsAt };
  const isTutor = mode === "tutor";
  const showResult = isTutor && canRecordResult(state, new Date(now));
  const showChange = isTutor && canRequestChange({ ...state, hasPendingChange: !!l.pendingChange });
  const [panel, setPanel] = useState<Panel>(
    showResult && l.status === "planned" ? "result" : "none",
  );
  const upcoming = Date.parse(l.endsAt) > now;

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <SubjectChip name={l.subjectName} color={l.color} />
          <StatusBadge status={l.displayStatus} />
        </div>
        <DialogTitle className="pt-1 text-xl">
          {mode === "student" ? l.subjectName : l.studentName}
        </DialogTitle>
        <DialogDescription className="grid gap-1">
          <span className="flex items-center gap-2">
            <ClockIcon className="size-4" />
            {formatDate(l.startsAt)} {formatWeekday(l.startsAt)} · {formatTime(l.startsAt)}–
            {formatTime(l.endsAt)}
          </span>
          <span className="flex items-center gap-2">
            <UserIcon className="size-4" />
            {mode === "student"
              ? l.tutorName
              : `${LESSON_TYPE_LABELS[l.lessonType]}${l.isFree ? " · hediye koçluk" : ""}`}
          </span>
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3">
        {l.approvalStatus === "pending" && (
          <Note tone="warning" icon={InfoIcon}>
            Bu ders kurucu onayı bekliyor. Onaylanınca öğrencinin takviminde görünecek.
          </Note>
        )}
        {l.approvalStatus === "rejected" && (
          <Note tone="danger" icon={XCircleIcon}>
            Kurucu bu dersi onaylamadı{l.rejectionReason ? `: ${l.rejectionReason}` : "."}
          </Note>
        )}
        {l.pendingChange && (
          <Note tone="warning" icon={CalendarClockIcon}>
            {l.pendingChange.type === "reschedule" && l.pendingChange.newStartsAt
              ? `Erteleme talebi onayda: ${formatDate(l.pendingChange.newStartsAt)} ${formatTime(l.pendingChange.newStartsAt)}`
              : "İptal talebi onayda"}
            {l.pendingChange.reason && (
              <span className="block opacity-80">“{l.pendingChange.reason}”</span>
            )}
          </Note>
        )}
        {isTutor && !l.pendingChange && l.lastRejectedChange && (
          <Note tone="danger" icon={XCircleIcon}>
            Son {l.lastRejectedChange.type === "reschedule" ? "erteleme" : "iptal"} talebiniz
            reddedildi{l.lastRejectedChange.note ? `: ${l.lastRejectedChange.note}` : "."}
          </Note>
        )}
        {l.topic && (
          <div className="rounded-xl bg-muted p-3 text-sm">
            <p className="text-xs font-semibold text-muted-foreground">Ders notu</p>
            <p className="mt-1 whitespace-pre-line">{l.topic}</p>
          </div>
        )}

        {l.meetingUrl && upcoming && l.approvalStatus === "approved" && l.status === "planned" && (
          <Button asChild size="lg" className="rounded-full">
            <a href={l.meetingUrl} target="_blank" rel="noreferrer">
              <ExternalLinkIcon className="size-4" />
              {mode === "student" ? "Derse katıl" : "Derse git"}
            </a>
          </Button>
        )}

        {isTutor && (showResult || showChange || canWithdraw(state) || l.pendingChange) && (
          <div className="grid gap-3 border-t pt-3">
            <div className="flex flex-wrap gap-2">
              {showResult && (
                <Button
                  size="sm"
                  variant={panel === "result" ? "default" : "outline"}
                  onClick={() => setPanel(panel === "result" ? "none" : "result")}
                >
                  Sonuç gir
                </Button>
              )}
              {showChange && (
                <>
                  <Button
                    size="sm"
                    variant={panel === "reschedule" ? "default" : "outline"}
                    onClick={() => setPanel(panel === "reschedule" ? "none" : "reschedule")}
                  >
                    Ertele
                  </Button>
                  <Button
                    size="sm"
                    variant={panel === "cancel" ? "destructive" : "outline"}
                    onClick={() => setPanel(panel === "cancel" ? "none" : "cancel")}
                  >
                    İptal et
                  </Button>
                </>
              )}
              {l.pendingChange && (
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={() => withdrawChangeRequest(l.pendingChange!.id)}
                >
                  Talebi geri çek
                </ActionButton>
              )}
              {canWithdraw(state) && (
                <ActionButton
                  size="sm"
                  variant="outline"
                  action={async () => {
                    const s = await withdrawLesson(l.id);
                    if (s?.success) close();
                    return s;
                  }}
                  confirmTitle="Ders geri çekilsin mi?"
                  confirmText="Ders takvimden kaldırılır."
                  confirmLabel="Geri çek"
                  destructive
                >
                  Dersi geri çek
                </ActionButton>
              )}
            </div>

            {panel === "result" && (
              <ActionForm
                action={recordLessonResult.bind(null, l.id)}
                submitLabel="Sonucu kaydet"
                onSuccess={close}
              >
                <SelectField
                  name="status"
                  label="Ders sonucu"
                  defaultValue={l.status === "planned" ? "completed" : l.status}
                  options={[
                    { value: "completed", label: "Tamamlandı" },
                    { value: "no_show", label: "Öğrenci gelmedi (hak yanmaz, ertelenir)" },
                    ...(l.status !== "planned"
                      ? [{ value: "planned", label: "Sonucu geri al" }]
                      : []),
                  ]}
                />
                <TextAreaField
                  name="topic"
                  label="İşlenen konu / not"
                  rows={3}
                  defaultValue={l.topic ?? ""}
                  hint="Öğrenci ve veli bu notu görür"
                />
              </ActionForm>
            )}

            {panel === "reschedule" && (
              <ActionForm
                action={requestLessonChange.bind(null, l.id)}
                submitLabel="Erteleme talebi gönder"
                onSuccess={close}
              >
                <input type="hidden" name="request_type" value="reschedule" />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    name="date"
                    label="Yeni tarih"
                    type="date"
                    required
                    defaultValue={toDateKey(new Date(l.startsAt))}
                  />
                  <TextField
                    name="time"
                    label="Yeni saat"
                    type="time"
                    step={900}
                    required
                    defaultValue={toTimeValue(new Date(l.startsAt))}
                  />
                </div>
                <TextAreaField
                  name="reason"
                  label="Açıklama"
                  rows={2}
                  required
                  placeholder="ör. Öğrencinin okul sınavı var"
                />
              </ActionForm>
            )}

            {panel === "cancel" && (
              <ActionForm
                action={requestLessonChange.bind(null, l.id)}
                submitLabel="İptal talebi gönder"
                submitVariant="destructive"
                onSuccess={close}
              >
                <input type="hidden" name="request_type" value="cancel" />
                <SelectField
                  name="cancel_status"
                  label="İptal eden"
                  defaultValue="cancelled_by_student"
                  options={[
                    { value: "cancelled_by_student", label: "Öğrenci / veli" },
                    { value: "cancelled_by_tutor", label: "Eğitmen" },
                  ]}
                />
                <TextAreaField name="reason" label="Açıklama" rows={2} required />
                <p className="text-xs text-muted-foreground">
                  Öğrencinin ders hakkı yanmaz. Mümkünse iptal yerine erteleme talebi gönderin.
                </p>
              </ActionForm>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Note({
  tone,
  icon: Icon,
  children,
}: {
  tone: "warning" | "danger";
  icon: typeof InfoIcon;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        tone === "warning"
          ? "flex gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning"
          : "flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
      }
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
