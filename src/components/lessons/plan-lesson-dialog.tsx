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
  const students = groupByStudent(context.assignments);
  const [studentId, setStudentId] = useState(students.length === 1 ? students[0].id : "");
  const student = students.find((st) => st.id === studentId);
  const [assignmentId, setAssignmentId] = useState(
    student?.options.length === 1 ? student.options[0].id : "",
  );
  const selected = student?.options.find((o) => o.id === assignmentId);

  function selectStudent(id: string) {
    setStudentId(id);
    const options = students.find((st) => st.id === id)?.options ?? [];
    setAssignmentId(options.length === 1 ? options[0].id : "");
  }

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
              name="student"
              label="Öğrenci"
              required
              placeholder="Öğrenci seçin"
              value={studentId}
              onChange={(e) => selectStudent(e.target.value)}
              options={students.map((st) => ({ value: st.id, label: st.name }))}
            />
            {student && student.remaining !== null && student.remaining <= 0 && (
              <p className="flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-sm text-warning">
                <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
                {student.name} öğrencisinin ders hakkı kalmadı. Planlamadan önce kuruculara
                danışın.
              </p>
            )}
            {student && student.remaining !== null && student.remaining > 0 && (
              <p className="-mt-2 text-xs text-muted-foreground">
                Kalan ders hakkı: <b className="text-foreground">{student.remaining}</b>
              </p>
            )}
            <SelectField
              name="assignment_id"
              label="Branş"
              required
              disabled={!student}
              placeholder={student ? "Branş seçin" : "Önce öğrenci seçin"}
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              options={(student?.options ?? []).map((o) => ({
                value: o.id,
                label: o.subjectName,
              }))}
            />
            {selected && (
              <p className="-mt-2 text-xs text-muted-foreground">
                Süre: <b className="text-foreground">{context.durations[selected.lessonType]} dk</b>{" "}
                ({LESSON_TYPE_LABELS[selected.lessonType]})
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

type Assignment = PlanningContext["assignments"][number];

/** Atamaları öğrenciye göre toplar: formda önce öğrenci, sonra o öğrencinin branşları */
function groupByStudent(assignments: Assignment[]) {
  const map = new Map<
    string,
    { id: string; name: string; remaining: number | null; options: Assignment[] }
  >();
  for (const a of assignments) {
    const entry = map.get(a.studentId) ?? {
      id: a.studentId,
      name: a.studentName,
      remaining: a.remaining,
      options: [],
    };
    entry.options.push(a);
    map.set(a.studentId, entry);
  }
  for (const entry of map.values())
    entry.options.sort((x, y) => x.subjectName.localeCompare(y.subjectName, "tr"));
  return [...map.values()];
}
