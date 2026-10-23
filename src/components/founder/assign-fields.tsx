"use client";

import { useState } from "react";
import { CheckboxGroupField, SelectField } from "@/components/shared/form-fields";

type Subject = { id: string; name: string; color?: string | null };
type Tutor = { id: string; fullName: string; subjectIds: string[] };

/**
 * Önce eğitmen, sonra öğrencinin o eğitmenden alacağı branşlar (birden fazla).
 * Yalnızca eğitmenin verdiği ve henüz atanmamış branşlar listelenir.
 * `assigned`: "tutorId:subjectId" çiftleri.
 */
export function AssignFields({
  subjects,
  tutors,
  assigned,
}: {
  subjects: Subject[];
  tutors: Tutor[];
  assigned: string[];
}) {
  const [tutorId, setTutorId] = useState("");
  const tutor = tutors.find((t) => t.id === tutorId);
  const available = tutor
    ? subjects.filter(
        (s) => tutor.subjectIds.includes(s.id) && !assigned.includes(`${tutor.id}:${s.id}`),
      )
    : [];

  return (
    <div className="grid gap-4">
      <SelectField
        name="tutor_id"
        label="Eğitmen"
        required
        placeholder="Eğitmen seçin"
        value={tutorId}
        onChange={(e) => setTutorId(e.target.value)}
        options={tutors.map((t) => ({ value: t.id, label: t.fullName }))}
      />
      {tutor &&
        (available.length ? (
          <CheckboxGroupField
            key={tutor.id}
            name="subject_ids"
            label="Alacağı branşlar"
            options={available.map((s) => ({
              value: s.id,
              label: s.name,
              color: s.color ?? undefined,
            }))}
          />
        ) : (
          <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning">
            Bu eğitmenin verdiği tüm branşlar zaten atanmış. Eğitmenin branşları eğitmen
            sayfasından düzenlenir.
          </p>
        ))}
      <p className="text-xs text-muted-foreground">
        Ders süresi branştan gelir: Koçluk {"→"} koçluk süresi, diğerleri özel ders süresi
        (Ayarlar).
      </p>
    </div>
  );
}
