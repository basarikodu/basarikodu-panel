"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

/** URL'deki ?q= değerini günceller (sunucu tarafında filtrelenir). */
export function SearchInput({ placeholder = "Ara…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (value) next.set("q", value);
      else next.delete("q");
      if (next.toString() !== params.toString()) router.replace(`${pathname}?${next}`);
    }, 250);
    return () => clearTimeout(t);
  }, [value, params, pathname, router]);

  return (
    <div className="relative w-full sm:w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-card pl-9"
      />
    </div>
  );
}
