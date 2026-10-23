import type { LucideIcon } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";

type Tone = "default" | "success" | "warning" | "destructive";

const toneClasses: Record<Tone, string> = {
  default: "bg-accent text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneClasses[tone])}
          >
            <Icon className="size-5" />
          </span>
        )}
      </CardContent>
    </Card>
  );
}
