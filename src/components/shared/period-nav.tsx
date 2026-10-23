import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  periodLabel,
  periodOf,
  shiftPeriod,
  type Period,
  type PeriodKind,
} from "@/features/finance/rules";

/** Hafta ↔ Ay geçişi ve önceki/sonraki dönem (?donem=hafta|ay&tarih=YYYY-MM-DD) */
export function PeriodNav({
  basePath,
  period,
  today,
  extra = {},
}: {
  basePath: string;
  period: Period;
  today: string;
  extra?: Record<string, string | undefined>;
}) {
  const href = (kind: PeriodKind, date: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
    q.set("donem", kind);
    if (date !== today) q.set("tarih", date);
    return `${basePath}?${q}`;
  };
  const prev = shiftPeriod(period, -1);
  const next = shiftPeriod(period, 1);
  const isCurrent = periodOf(period.kind, today).start === period.start;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-full border bg-card p-1">
        {(["hafta", "ay"] as const).map((k) => (
          <Link
            key={k}
            href={href(k, period.start > today || isCurrent ? today : period.start)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              period.kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {k === "hafta" ? "Haftalık" : "Aylık"}
          </Link>
        ))}
      </div>
      <Button asChild size="icon" variant="outline" className="rounded-full bg-card">
        <Link href={href(period.kind, prev.start)} aria-label="Önceki dönem">
          <ChevronLeftIcon className="size-4" />
        </Link>
      </Button>
      <p className="min-w-36 text-center font-heading font-bold">{periodLabel(period)}</p>
      <Button asChild size="icon" variant="outline" className="rounded-full bg-card">
        <Link href={href(period.kind, next.start)} aria-label="Sonraki dönem">
          <ChevronRightIcon className="size-4" />
        </Link>
      </Button>
      {!isCurrent && (
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href={href(period.kind, today)}>Bugün</Link>
        </Button>
      )}
    </div>
  );
}
