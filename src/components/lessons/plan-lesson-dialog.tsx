"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useState } from "react";
import { ActionForm } from "@/components/shared/action-form";
import { SelectField, TextField } from "@/components/shared/form-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planLessons } from "@/features/lessons/actions";
import type { PlanningContext } from "@/features/lessons/queries";
import { LESSON_TYPE_LABELS } from "@/lib/constants";

const REPEAT_OPTIONS = [
  { value: "1", label: "Tek ders" },
  { value: "4", label: "Her hafta · 4 hafta" },
  { value: "8", label: "Her hafta · 8 hafta" },
  { value: "12", label: "Her hafta · 12 hafta" },
  { value: "16", label: "Her hafta · 16 hafta" },
];

export function PlanLessonDialog({
  open,
  onOpenChange,
  context,
  prefill,
  founderMode = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: PlanningContext;
  prefill: { date: string; time: string };
  founderMode?: boolean;
}) {
  const [assignmentId, setAssignmentId] = useState(
    context.assignments.length === 1 ? context.assignments[0].id : "",
  );
  const selected = context.assignments.find((a) => a.id === assignmentId);
  const defaultDuration = selected ? context.durations[selected.lessonType] : 60;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ders planla</DialogTitle>
          <DialogDescription>
            {founderMode
              ? "Kurucu olarak eklediğiniz ders doğrudan onaylanır."
              : "Planladığınız ders kurucu onayına gider; onaylanınca öğrenci takviminde görünür."}
          </DialogDescription>
        </DialogHeader>
        {context.assignments.length === 0 ? (
          <p className="rounded-xl bg-warning-soft p-4 text-sm text-warning">
            Size henüz öğrenci atanmamış. Atamayı kurucular yapar.
          </p>
        ) : (
          <ActionForm
            key={`${prefill.date}-${prefill.time}`}
            action={planLessons}
            submitLabel={founderMode ? "Dersi ekle" : "Onaya gönder"}
            onSuccess={() => onOpenChange(false)}
          >
            <SelectField
              name="assignment_id"
              label="Öğrenci ve branş"
              required
              placeholder="Öğrenci seçin"
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              options={context.assignments.map((a) => ({
                value: a.id,
                label: `${a.studentName} — ${a.subjectName} (${LESSON_TYPE_LABELS[a.lessonType]})`,
              }))}
            />
            {selected && selected.remaining !== null && selected.remaining <= 0 && (
              <p className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                {selected.studentName} öğrencisinin ders hakkı kalmadı. Planlamadan önce kuruculara
                danışın.
              </p>
            )}
            {selected && selected.remaining !== null && selected.remaining > 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                Kalan ders hakkı: <b className="text-foreground">{selected.remaining}</b>
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <TextField
                name="date"
                label="Tarih"
                type="date"
                required
                defaultValue={prefill.date}
              />
              <TextField
                name="time"
                label="Saat"
                type="time"
                step={900}
                required
                defaultValue={prefill.time}
              />
              <TextField
                key={defaultDuration}
                name="duration"
                label="Süre (dk)"
                type="number"
                min={15}
                max={240}
                step={5}
                required
                defaultValue={defaultDuration}
              />
              <SelectField name="weeks" label="Tekrar" defaultValue="1" options={REPEAT_OPTIONS} />
            </div>
            <TextField
              name="meeting_url"
              label="Ders linki (Zoom/Meet)"
              type="url"
              placeholder="https://"
              defaultValue={context.defaultMeetingUrl ?? ""}
            />
          </ActionForm>
        )}
      </DialogContent>
    </Dialog>
  );
}
