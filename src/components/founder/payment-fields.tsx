import { SelectField, TextField } from "@/components/shared/form-fields";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";

/** Tahsilat formu alanları */
export function PaymentFields({
  studentOptions,
  today,
  studentId,
}: {
  studentOptions: { value: string; label: string }[];
  today: string;
  studentId?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="student_id"
        label="Öğrenci"
        required
        placeholder="Öğrenci seçin"
        defaultValue={studentId ?? ""}
        options={studentOptions}
        className="sm:col-span-2"
      />
      <TextField name="amount" label="Tutar (₺)" type="number" min={1} step="0.01" required />
      <TextField name="paid_at" label="Ödeme tarihi" type="date" required defaultValue={today} />
      <SelectField
        name="method"
        label="Yöntem"
        defaultValue="havale"
        options={Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({ value, label }))}
      />
      <TextField name="note" label="Not" placeholder="ör. Kasım paketi" />
    </div>
  );
}
