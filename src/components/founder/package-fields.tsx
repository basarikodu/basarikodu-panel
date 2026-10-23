"use client";

import { useState } from "react";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { PACKAGE_PRESETS } from "@/lib/constants";

type Option = { value: string; label: string };

/** Ay + paket seçimi; hazır paket seçilince önerilen tutar doldurulur. */
export function PackageFields({
  monthOptions,
  defaults,
}: {
  monthOptions: Option[];
  defaults?: { month?: string; lesson_count?: number; price_total?: number; note?: string | null };
}) {
  const initialPreset =
    defaults?.lesson_count === undefined
      ? "8"
      : PACKAGE_PRESETS.some((p) => p.lessons === defaults.lesson_count)
        ? String(defaults.lesson_count)
        : "custom";
  const [preset, setPreset] = useState(initialPreset);
  const [price, setPrice] = useState(String(defaults?.price_total ?? 6800));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SelectField
        name="month"
        label="Ay"
        required
        defaultValue={defaults?.month ?? monthOptions[0]?.value}
        options={monthOptions}
      />
      <SelectField
        name="preset"
        label="Paket"
        value={preset}
        onChange={(e) => {
          setPreset(e.target.value);
          const p = PACKAGE_PRESETS.find((x) => String(x.lessons) === e.target.value);
          if (p) setPrice(String(p.price));
        }}
        options={[
          ...PACKAGE_PRESETS.map((p) => ({ value: String(p.lessons), label: p.label })),
          { value: "custom", label: "Özel ders sayısı" },
        ]}
      />
      {preset === "custom" && (
        <TextField
          name="lesson_count"
          label="Ders sayısı"
          type="number"
          min={1}
          max={60}
          required
          defaultValue={defaults?.lesson_count ?? ""}
        />
      )}
      <TextField
        name="price_total"
        label="Paket tutarı (₺)"
        type="number"
        min={0}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        hint="Öğrenciden alınacak toplam; gelir takibinde kullanılır"
      />
      <TextField
        name="note"
        label="Not"
        className="sm:col-span-2"
        placeholder="ör. Matematik 8 + Fizik 4"
        defaultValue={defaults?.note ?? ""}
      />
    </div>
  );
}
