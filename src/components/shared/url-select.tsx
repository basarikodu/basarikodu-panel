"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Seçim değişince URL'deki parametreyi günceller (sunucu tarafı filtre) */
export function UrlSelect({
  param,
  options,
  placeholder,
  label,
}: {
  param: string;
  options: { value: string; label: string }[];
  placeholder: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <select
      aria-label={label}
      value={params.get(param) ?? ""}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        if (e.target.value) next.set(param, e.target.value);
        else next.delete(param);
        router.replace(`${pathname}?${next}`);
      }}
      className="h-9 rounded-full border border-input bg-card px-4 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
