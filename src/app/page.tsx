import Link from "next/link";
import { ArrowRightIcon, ShieldCheckIcon, UsersIcon } from "lucide-react";
import { Logo } from "@/components/shared/logo";

const entries = [
  {
    href: "/giris",
    title: "Eğitmen / Öğrenci Girişi",
    description: "Derslerini planla, haftalık takvimini ve ders geçmişini gör.",
    icon: UsersIcon,
  },
  {
    href: "/kurucu/giris",
    title: "Kurucu Girişi",
    description: "Eğitmenler, öğrenciler, onaylar ve gelir-gider.",
    icon: ShieldCheckIcon,
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Logo className="scale-125" />
      <h1 className="mt-8 text-center text-3xl font-extrabold text-primary sm:text-4xl">
        Başarının Kodu Sende Gizli
      </h1>
      <p className="mt-2 text-center text-muted-foreground">
        BaşarıKodu yönetim paneline hoş geldin.
      </p>

      <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        {entries.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-accent text-primary">
              <Icon className="size-5" />
            </span>
            <p className="mt-4 font-heading text-lg font-bold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-success">
              Giriş yap <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
