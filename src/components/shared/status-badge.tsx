import {
  BanIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  ClockIcon,
  HourglassIcon,
  UserXIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";
import { LESSON_STATUS_LABELS, type LessonDisplayStatus } from "@/lib/constants";

const styles: Record<LessonDisplayStatus, { className: string; icon: LucideIcon }> = {
  pending_approval: {
    className: "border-dashed border-warning bg-warning-soft text-warning",
    icon: HourglassIcon,
  },
  rejected: { className: "bg-destructive/10 text-destructive line-through", icon: BanIcon },
  planned: { className: "bg-accent text-primary", icon: ClockIcon },
  completed: { className: "bg-success-soft text-success", icon: CircleCheckIcon },
  no_show: { className: "bg-warning-soft text-warning", icon: UserXIcon },
  cancelled_by_student: { className: "bg-destructive/10 text-destructive", icon: XCircleIcon },
  cancelled_by_tutor: { className: "bg-destructive/10 text-destructive", icon: XCircleIcon },
  postponed: { className: "bg-muted text-muted-foreground", icon: CalendarClockIcon },
};

export function StatusBadge({
  status,
  className,
}: {
  status: LessonDisplayStatus;
  className?: string;
}) {
  const { className: tone, icon: Icon } = styles[status];
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full border border-transparent px-2.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" />
      {LESSON_STATUS_LABELS[status]}
    </span>
  );
}
