import { SelectField, TextAreaField, TextField } from "@/components/shared/form-fields";
import { STUDENT_GOAL_LABELS } from "@/lib/constants";

export type StudentDefaults = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  grade?: number | null;
  goal?: string;
  school?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  notes?: string | null;
};

const GRADE_OPTIONS = [
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}. sınıf` })),
  { value: "13", label: "Mezun" },
];

export function StudentFields({ defaults = {} }: { defaults?: StudentDefaults }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        name="full_name"
        label="Öğrenci ad soyad"
        required
        defaultValue={defaults.full_name}
      />
      <TextField
        name="email"
        label="E-posta (giriş için)"
        type="email"
        required
        defaultValue={defaults.email ?? ""}
        hint="Veli ile ortak kullanılabilir"
      />
      <TextField
        name="phone"
        label="Öğrenci telefonu"
        type="tel"
        defaultValue={defaults.phone ?? ""}
      />
      <TextField name="school" label="Okul" defaultValue={defaults.school ?? ""} />
      <SelectField
        name="grade"
        label="Sınıf"
        placeholder="Seçin"
        defaultValue={defaults.grade ? String(defaults.grade) : ""}
        options={GRADE_OPTIONS}
      />
      <SelectField
        name="goal"
        label="Hedef"
        defaultValue={defaults.goal ?? "okul"}
        options={Object.entries(STUDENT_GOAL_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <TextField
        name="guardian_name"
        label="Veli ad soyad"
        defaultValue={defaults.guardian_name ?? ""}
      />
      <TextField
        name="guardian_phone"
        label="Veli telefonu"
        type="tel"
        defaultValue={defaults.guardian_phone ?? ""}
      />
      <TextAreaField
        name="notes"
        label="Kurucu notu"
        className="sm:col-span-2"
        rows={3}
        defaultValue={defaults.notes ?? ""}
        hint="Yalnızca kurucular görür"
      />
    </div>
  );
}
