import { cn } from "cn";
import { formatMoney } from "@/lib/format";

export function MoneyText({
  value,
  className,
}: {
  value: number | string | null | undefined;
  className?: string;
}) {
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>{formatMoney(value)}</span>
  );
}
