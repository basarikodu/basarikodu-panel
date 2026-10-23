import { ArrowRightIcon, CircleAlertIcon, GraduationCapIcon, PresentationIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-card";
import { getCurrentProfile, ROLE_HOME } from "@/lib/auth";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";

// Kurucu girişi bilerek burada yok: /kurucu/giris adresinden girilir.
const entries = [
  { href: "/giris/ogrenci", title: "Öğrenci / Veli Girişi", icon: GraduationCapIcon },
  { href: "/giris/egitmen", title: "Eğitmen Girişi", icon: PresentationIcon },
];

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const profile = await getCurrentProfile();
  if (profile) redirect(ROLE_HOME[profile.role]);
  const { hata } = await searchParams;

  return (
    <AuthShell>
      <h1 className="text-[26px] font-extrabold tracking-tight sm:text-3xl">Hoş geldiniz</h1>
      <p className="mt-2 text-muted-foreground">Devam etmek için giriş türünü seçin.</p>

      {hata === "baglanti" && (
        <p className="mt-6 flex items-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlertIcon className="size-4 shrink-0" /> Bağlantının süresi dolmuş veya geçersiz.
        </p>
      )}

      <nav className="mt-8 grid gap-3" aria-label="Giriş türü">
        {entries.map(({ href, title, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover focus-visible:ring-4 focus-visible:ring-primary/15 focus-visible:outline-none sm:p-5"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-6" />
            </span>
            <span className="flex-1 font-heading text-[17px] font-bold">{title}</span>
            <span className="grid size-9 place-items-center rounded-full bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </nav>

      <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
        Hesabınız yok mu veya şifrenizi mi unuttunuz?{" "}
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-success hover:underline"
        >
          WhatsApp&apos;tan yazın
        </a>
      </p>
    </AuthShell>
  );
}
