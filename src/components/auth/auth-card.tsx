import Link from "next/link";
import { cn } from "cn";
import { Logo } from "@/components/shared/logo";

export function AuthCard({
  title,
  description,
  children,
  footer,
  dark = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <main
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-12",
        dark && "bg-sidebar",
      )}
    >
      <Link href="/" aria-label="Ana sayfa">
        <Logo inverted={dark} />
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <div
          className={cn("mt-6 text-sm", dark ? "text-sidebar-foreground" : "text-muted-foreground")}
        >
          {footer}
        </div>
      )}
    </main>
  );
}
