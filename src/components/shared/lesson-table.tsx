import { CalendarDaysIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { SubjectChip } from "@/components/shared/subject-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LESSON_TYPE_LABELS, type LessonDisplayStatus } from "@/lib/constants";
import { formatDate, formatTime, formatWeekday } from "@/lib/format";
import type { Enums } from "@/types/database";

export type LessonRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: Enums<"lesson_status">;
  approval_status: Enums<"approval_status">;
  lesson_type: Enums<"lesson_type">;
  topic: string | null;
  is_free?: boolean;
  subject: { name: string; color: string } | null;
  /** Karşı taraf (eğitmen veya öğrenci) */
  person?: string;
};

export function displayStatus(
  l: Pick<LessonRow, "status" | "approval_status">,
): LessonDisplayStatus {
  if (l.approval_status === "pending") return "pending_approval";
  if (l.approval_status === "rejected") return "rejected";
  return l.status;
}

export function LessonTable({
  lessons,
  personLabel,
}: {
  lessons: LessonRow[];
  personLabel?: string;
}) {
  if (lessons.length === 0) {
    return <EmptyState icon={CalendarDaysIcon} title="Henüz ders yok" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tarih</TableHead>
          <TableHead>Ders</TableHead>
          {personLabel && <TableHead className="hidden sm:table-cell">{personLabel}</TableHead>}
          <TableHead className="hidden md:table-cell">Not</TableHead>
          <TableHead className="text-right">Durum</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lessons.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="whitespace-nowrap">
              <p className="font-medium">{formatDate(l.starts_at)}</p>
              <p className="text-xs text-muted-foreground">
                {formatWeekday(l.starts_at)} · {formatTime(l.starts_at)}–{formatTime(l.ends_at)}
              </p>
            </TableCell>
            <TableCell>
              {l.subject && <SubjectChip name={l.subject.name} color={l.subject.color} />}
              <p className="mt-1 text-xs text-muted-foreground">
                {LESSON_TYPE_LABELS[l.lesson_type]}
              </p>
            </TableCell>
            {personLabel && <TableCell className="hidden sm:table-cell">{l.person}</TableCell>}
            <TableCell className="hidden max-w-xs truncate text-sm text-muted-foreground md:table-cell">
              {l.topic ?? "—"}
            </TableCell>
            <TableCell className="text-right">
              <StatusBadge status={displayStatus(l)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
