import { CheckboxGroupField, SelectField, TextField } from "@/components/shared/form-fields";

type Subject = { id: string; name: string; color: string };

export type TutorDefaults = {
  full_name?: string;
  email?: string | null;
  phone?: string | null;
  university?: string | null;
  department?: string | null;
  yks_rank?: number | null;
  iban?: string | null;
  payout_frequency?: string;
  default_meeting_url?: string | null;
  subjectIds?: string[];
};

export function TutorFields({
  subjects,
  defaults = {},
}: {
  subjects: Subject[];
  defaults?: TutorDefaults;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="full_name" label="Ad Soyad" required defaultValue={defaults.full_name} />
      <TextField
        name="email"
        label="E-posta (giriş için)"
        type="email"
        required
        defaultValue={defaults.email ?? ""}
      />
      <TextField name="phone" label="Telefon" type="tel" defaultValue={defaults.phone ?? ""} />
      <TextField
        name="yks_rank"
        label="YKS derecesi"
        type="number"
        min={1}
        defaultValue={defaults.yks_rank ?? ""}
      />
      <TextField name="university" label="Üniversite" defaultValue={defaults.university ?? ""} />
      <TextField name="department" label="Bölüm" defaultValue={defaults.department ?? ""} />
      <TextField
        name="iban"
        label="IBAN"
        placeholder="TR00 0000 …"
        defaultValue={defaults.iban ?? ""}
        hint="Eğitmen ödemeleri listesinde gösterilir"
      />
      <SelectField
        name="payout_frequency"
        label="Ödeme sıklığı"
        defaultValue={defaults.payout_frequency ?? "monthly"}
        options={[
          { value: "monthly", label: "Aylık" },
          { value: "weekly", label: "Haftalık" },
        ]}
      />
      <TextField
        name="default_meeting_url"
        label="Kişisel ders linki (Zoom/Meet)"
        type="url"
        className="sm:col-span-2"
        defaultValue={defaults.default_meeting_url ?? ""}
        hint="Ders planlarken otomatik doldurulur"
      />
      <div className="sm:col-span-2">
        <CheckboxGroupField
          name="subjects"
          label="Verebildiği branşlar"
          defaultValues={defaults.subjectIds}
          options={subjects.map((s) => ({ value: s.id, label: s.name, color: s.color }))}
        />
      </div>
    </div>
  );
}
