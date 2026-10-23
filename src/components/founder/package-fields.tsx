"use client";

import { useState } from "react";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { suggestedPackagePrice, type LessonPrices } from "@/features/packages/rules";
import { MULTI_LESSON_THRESHOLD, PACKAGE_PRESETS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

type Option = { value: string; label: string };

/** Ay + paket seçimi; tutar Ayarlar'daki ders fiyatlarından otomatik önerilir. */
export function PackageFields({
  monthOptions,
  prices,
  defaults,
}: {
  monthOptions: Option[];
  prices: LessonPrices;
  defaults?: { month?: string; lesson_count?: number; price_total?: number; note?: string | null };
}) {
  const initialCount = defaults?.lesson_count ?? 8;
  const [preset, setPreset] = useState(
    PACKAGE_PRESETS.some((p) => p.lessons === initialCount) ? String(initialCount) : "custom",
  );
  const [count, setCount] = useState(String(initialCount));
  const [price, setPrice] = useState(
    String(defaults?.price_total ?? suggestedPackagePrice(initialCount, prices)),
  );

  const applyCount = (value: string) => {
    setCount(value);
    setPrice(String(suggestedPackagePrice(Number(value), prices, MULTI_LESSON_THRESHOLD)));
  };
  const n = Number(count);
  const unit = n >= MULTI_LESSON_THRESHOLD ? prices.multi : prices.single;

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
          if (e.target.value !== "custom") applyCount(e.target.value);
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
          value={count}
          onChange={(e) => applyCount(e.target.value)}
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
        hint={
          n > 0
            ? `${n} ders × ${formatMoney(unit)} (${n >= MULTI_LESSON_THRESHOLD ? "haftada 2+ fiyatı" : "haftada 1 fiyatı"}) — değiştirebilirsiniz`
            : undefined
        }
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
