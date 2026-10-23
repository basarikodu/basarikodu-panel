import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/**
 * Giriş ekranlarının ortak düzeni: masaüstünde solda marka paneli, sağda içerik;
 * mobilde üstte kompakt marka bandı. `badge`: marka panelindeki küçük etiket.
 */
export function AuthShell({
  children,
  badge = "Özel Ders & Koçluk Paneli",
}: {
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex min-h-svh flex-1 flex-col bg-card lg:flex-row">
      {/* Marka paneli */}
      <aside className="relative isolate overflow-hidden bg-gradient-to-br from-[#0d1f4d] via-sidebar to-[#081331] px-6 pt-7 pb-12 text-white lg:flex lg:w-[46%] lg:max-w-[720px] lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 [background-image:linear-gradient(rgb(255_255_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.07)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top_left,black_15%,transparent_70%)] [background-size:44px_44px]"
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-24 -z-10 size-[420px] rounded-full bg-[#3f6fd1]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-20 -z-10 size-[420px] rounded-full bg-[#2e8220]/25 blur-3xl"
        />
        <Image
          src="/logo.png"
          alt=""
          aria-hidden
          width={360}
          height={360}
          className="pointer-events-none absolute -right-20 -bottom-20 -z-10 hidden opacity-[0.035] grayscale lg:block"
        />

        <Link href="/" aria-label="Ana sayfa" className="inline-flex w-fit">
          <Logo inverted size={40} />
        </Link>

        <div className="mt-8 lg:mt-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-[#c9d3ea]">
            <span className="size-1.5 rounded-full bg-[#6fc25a]" />
            {badge}
          </span>
          <p className="mt-4 font-heading text-[30px] leading-[1.08] font-extrabold tracking-tight sm:text-4xl lg:mt-6 lg:text-[56px]">
            Başarının Kodu
            <br />
            <span className="bg-gradient-to-r from-[#9be08a] to-[#5fb34b] bg-clip-text text-transparent">
              Sende Gizli
            </span>
          </p>
        </div>

        <p className="hidden text-sm text-[#9fb0d6] lg:block">© 2026 BaşarıKodu · basarikodu.com</p>
      </aside>

      {/* İçerik */}
      <main className="relative -mt-6 flex flex-1 flex-col items-center rounded-t-[28px] bg-card px-5 pt-9 pb-12 sm:px-8 lg:mt-0 lg:justify-center lg:rounded-none lg:py-16">
        <div className="w-full max-w-[420px]">{children}</div>
      </main>
    </div>
  );
}

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
  /** Kurucu girişi: marka panelinde yönetim etiketi */
  dark?: boolean;
}) {
  return (
    <AuthShell badge={dark ? "Kurucu Yönetim Paneli" : undefined}>
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
    </AuthShell>
  );
}
