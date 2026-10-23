"use client";

import { useState } from "react";
import { SelectField } from "@/components/shared/form-fields";

type Subject = { id: string; name: string };
type Tutor = { id: string; fullName: string; subjectIds: string[] };

/** Branş seçilince yalnızca o branşı veren eğitmenler listelenir. */
export function AssignFields({ subjects, tutors }: { subjects: Subject[]; tutors: Tutor[] }) {
  const [subjectId, setSubjectId] = useState("");
  const coaching = subjects.find((s) => s.id === subjectId)?.name === "Koçluk";
  const matching = subjectId ? tutors.filter((t) => t.subjectIds.includes(subjectId)) : tutors;

  return (
    <div className="grid gap-4">
      <SelectField
        name="subject_id"
        label="Branş"
        required
        placeholder="Branş seçin"
        value={subjectId}
        onChange={(e) => setSubjectId(e.target.value)}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <SelectField
        name="tutor_id"
        label="Eğitmen"
        required
        placeholder={matching.length ? "Eğitmen seçin" : "Bu branşı veren eğitmen yok"}
        options={matching.map((t) => ({ value: t.id, label: t.fullName }))}
        hint={subjectId ? "Eğitmenin branşları eğitmen sayfasından düzenlenir" : undefined}
      />
      <SelectField
        key={coaching ? "kocluk" : "ozel"}
        name="lesson_type"
        label="Ders tipi"
        defaultValue={coaching ? "kocluk" : "ozel_ders"}
        options={[
          { value: "ozel_ders", label: "Özel ders (60 dk)" },
          { value: "kocluk", label: "Koçluk (40 dk)" },
        ]}
      />
    </div>
  );
}
