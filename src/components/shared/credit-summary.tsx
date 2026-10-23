import { cn } from "cn";
import {
  creditTone,
  monthProgress,
  type CreditRow,
  type CreditTone,
} from "@/features/packages/rules";

const toneClass: Record<CreditTone, string> = {
  none: "bg-muted text-muted-foreground",
  ok: "bg-success-soft text-success",
  low: "bg-warning-soft text-warning",
  out: "bg-destructive/10 text-destructive",
};

/** Listelerde kısa gösterim: "4 hak" */
export function CreditBadge({ row }: { row: CreditRow | null }) {
  const tone = creditTone(row);
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap tabular-nums",
        toneClass[tone],
      )}
    >
      {tone === "none" ? "Paket yok" : `${row!.remaining} hak`}
    </span>
  );
}

/** Ay özeti: "Ekim paketi 8 · 5 tamamlandı · 1 devreden · Kalan 4" + ilerleme çubuğu */
export function CreditSummary({
  row,
  monthLabel,
  audience = "founder",
}: {
  row: CreditRow | null;
  monthLabel: string;
  audience?: "founder" | "student";
}) {
  if (!row || row.total_credits === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {audience === "student"
          ? "Henüz tanımlı bir paketin yok."
          : "Bu öğrenci için paket tanımlanmamış."}
      </p>
    );
  }
  const tone = creditTone(row);
  const { available, pct } = monthProgress(row);
  return (
    <div className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {audience === "student" ? "Kalan ders hakkın" : "Kalan ders hakkı"}
          </p>
          <p
            className={cn(
              "font-heading text-3xl font-extrabold tabular-nums",
              tone === "out"
                ? "text-destructive"
                : tone === "low"
                  ? "text-warning"
                  : "text-primary",
            )}
          >
            {row.remaining}
          </p>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          {monthLabel} paketi: <b className="text-foreground">{row.month_package} ders</b>
          {row.carried_over !== 0 && (
            <>
              <br />
              {row.carried_over > 0 ? "Devreden" : "Önceki aydan fazla"}:{" "}
              <b className="text-foreground">{Math.abs(row.carried_over)}</b>
            </>
          )}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-success transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {monthLabel}: {available} hakkın <b className="text-foreground">{row.month_completed}</b>{" "}
        dersi tamamlandı · Toplam {row.used_credits} ders
      </p>
    </div>
  );
}
