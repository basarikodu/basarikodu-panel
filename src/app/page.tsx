import { ArrowRightIcon, CircleAlertIcon, GraduationCapIcon, PresentationIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";

// Kurucu girişi bilerek burada yok: /kurucu/giris adresinden girilir.
const entries = [
  {
    href: "/giris/ogrenci",
    title: "Öğrenci / Veli Girişi",
    description: "Haftalık ders takvimin, kalan ders hakkın ve ders geçmişin.",
    icon: GraduationCapIcon,
  },
  {
    href: "/giris/egitmen",
    title: "Eğitmen Girişi",
    description: "Haftalık ders planlaman, öğrencilerin ve ders sonuçların.",
    icon: PresentationIcon,
  },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const profile = await getCurrentProfile();
  if (profile) redirect(ROLE_HOME[profile.role]);
  const { hata } = await searchParams;

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-14">
      {/* Arka plan: logodaki lacivert ve yeşil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] rounded-b-[48px] bg-gradient-to-br from-hero-from via-[#0f2558] to-hero-to"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-120px] right-[-80px] size-[340px] rounded-full bg-[#2e8220]/25 blur-3xl"
      />

      <div className="relative flex w-full max-w-3xl flex-col items-center">
        <Image
          src="/logo.png"
          alt="BaşarıKodu"
          width={112}
          height={112}
          priority
          className="rounded-full bg-white shadow-xl ring-4 ring-white/20"
        />
        <h1 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Başarının Kodu Sende Gizli
        </h1>
        <p className="mt-3 text-center text-[#c9d3ea]">BaşarıKodu Özel Ders & Koçluk Paneli</p>

        {hata === "baglanti" && (
          <p className="mt-6 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm text-destructive shadow">
            <CircleAlertIcon className="size-4" /> Bağlantının süresi dolmuş veya geçersiz.
          </p>
        )}

        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
          {entries.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[28px] border bg-card p-7 shadow-xl shadow-[#0b1a40]/10 transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-7" />
              </span>
              <p className="mt-5 font-heading text-xl font-bold">{title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Giriş yap
                <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Hesabın yok mu veya şifreni mi unuttun?{" "}
          <a
            href={SUPPORT_WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-success hover:underline"
          >
            WhatsApp&apos;tan yaz
          </a>
        </p>
      </div>
    </main>
  );
}
