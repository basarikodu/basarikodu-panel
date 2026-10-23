import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

export type HeroStat = {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  href?: string;
  /** Dikkat çekmesi gereken değer (ör. bekleyen onay) */
  highlight?: boolean;
  /** Küçük açıklama (ör. önceki döneme göre değişim) */
  hint?: React.ReactNode;
  /** Para gibi uzun değerler için daha küçük yazı */
  compact?: boolean;
};

/** Referans tasarımdaki koyu lacivert istatistik bandı */
export function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-hero-from via-[#0f2558] to-hero-to p-2.5 shadow-xl shadow-[#0b1a40]/15 sm:p-4">
      {/* Hafif marka ışıkları */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-[#3f6fd1]/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 left-1/4 -z-10 size-64 rounded-full bg-[#2e8220]/20 blur-3xl"
      />
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, highlight, hint, compact }) => {
          const body = (
            <>
              <Icon
                className={cn("size-4 sm:size-5", highlight ? "text-[#f5b14b]" : "text-[#7fb2ff]")}
              />
              <p
                className={cn(
                  "mt-2.5 font-heading font-bold break-words text-white tabular-nums sm:mt-4",
                  compact ? "text-lg sm:text-3xl" : "text-3xl sm:text-5xl",
                )}
              >
                {value}
              </p>
              <p className="mt-1 text-xs leading-snug text-[#c9d3ea] sm:mt-2 sm:text-sm">{label}</p>
              {hint && <p className="mt-1 text-xs text-[#9fb0d6]">{hint}</p>}
            </>
          );
          const cls =
            "block rounded-[20px] border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-sm transition sm:p-6";
          return href ? (
            <Link key={label} href={href} className={cn(cls, "hover:bg-white/[0.08]")}>
              {body}
            </Link>
          ) : (
            <div key={label} className={cls}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "mb-3 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </h2>
  );
}
