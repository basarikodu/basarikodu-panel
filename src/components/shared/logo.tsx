import { GraduationCapIcon } from "lucide-react";
import { cn } from "cn";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-heading font-extrabold", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-success text-white">
        <GraduationCapIcon className="size-5" />
      </span>
      <span className="text-lg tracking-tight">
        <span className={inverted ? "text-white" : "text-primary"}>Başarı</span>
        <span className="text-success">Kodu</span>
      </span>
    </span>
  );
}
