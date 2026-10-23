import { cn } from "cn";

export function initials(name: string) {
  return name
    .replace(/\(.*?\)/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr-TR"))
    .join("");
}

/** Baş harfli yuvarlak avatar (referans tasarımdaki "RE" rozeti) */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-white font-semibold text-primary",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
