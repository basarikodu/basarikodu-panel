import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { addDays, type DateKey } from "@/features/lessons/rules";

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function label(weekStart: DateKey) {
  const end = addDays(weekStart, 6);
  const [y1, m1, d1] = weekStart.split("-").map(Number);
  const [y2, m2, d2] = end.split("-").map(Number);
  const left = m1 === m2 ? `${d1}` : `${d1} ${MONTHS[m1 - 1]}`;
  return `${left} – ${d2} ${MONTHS[m2 - 1]} ${y2 !== y1 ? `${y1}/` : ""}${y2}`;
}

/** Hafta değiştirici: ?hafta=YYYY-MM-DD (Pazartesi) */
export function WeekNav({
  basePath,
  weekStart,
  currentWeek,
}: {
  basePath: string;
  weekStart: DateKey;
  currentWeek: DateKey;
}) {
  const sep = basePath.includes("?") ? "&" : "?";
  const href = (w: DateKey) => (w === currentWeek ? basePath : `${basePath}${sep}hafta=${w}`);
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="icon" variant="outline" className="rounded-full bg-card">
        <Link href={href(addDays(weekStart, -7))} aria-label="Önceki hafta">
          <ChevronLeftIcon className="size-4" />
        </Link>
      </Button>
      <p className="min-w-40 text-center font-heading font-bold">{label(weekStart)}</p>
      <Button asChild size="icon" variant="outline" className="rounded-full bg-card">
        <Link href={href(addDays(weekStart, 7))} aria-label="Sonraki hafta">
          <ChevronRightIcon className="size-4" />
        </Link>
      </Button>
      {weekStart !== currentWeek && (
        <Button asChild size="sm" variant="ghost" className="rounded-full">
          <Link href={basePath}>Bu hafta</Link>
        </Button>
      )}
    </div>
  );
}
