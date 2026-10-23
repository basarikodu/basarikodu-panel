import Image from "next/image";
import { cn } from "cn";

export function Logo({
  className,
  inverted = false,
  size = 36,
  showText = true,
}: {
  className?: string;
  inverted?: boolean;
  size?: number;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-heading font-extrabold", className)}>
      <Image
        src="/logo.png"
        alt="BaşarıKodu"
        width={size}
        height={size}
        priority
        className="shrink-0 rounded-full bg-white shadow-sm ring-2 ring-white/80"
      />
      {showText && (
        <span className="text-lg leading-none tracking-tight">
          <span className={inverted ? "text-white" : "text-primary"}>Başarı</span>
          <span className={inverted ? "text-[#6fc25a]" : "text-success"}>Kodu</span>
        </span>
      )}
    </span>
  );
}
