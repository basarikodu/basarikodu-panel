import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenCheckIcon, HourglassIcon, UsersIcon, WalletIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Logo } from "@/components/shared/logo";
import { MoneyText } from "@/components/shared/money-text";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LessonDisplayStatus } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Bileşen vitrini" };

const statuses: LessonDisplayStatus[] = [
  "pending_approval",
  "planned",
  "completed",
  "no_show",
  "postponed",
  "cancelled_by_tutor",
  "rejected",
];

// Geliştirme sırasında tasarım sistemini kontrol etmek için; canlıda kapalı.
export default function ShowcasePage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_SHOWCASE !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <Logo />
      <div className="mt-8">
        <PageHeader
          title="Bileşen vitrini"
          description="Marka renkleri, tipografi ve ortak bileşenler"
          actions={
            <>
              <Button variant="outline">İkincil</Button>
              <Button>+ Ders planla</Button>
            </>
          }
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Bu hafta yapılan ders"
          value="42"
          hint="Geçen hafta 38"
          icon={BookOpenCheckIcon}
          tone="success"
        />
        <StatCard label="Onay bekleyen" value="5" icon={HourglassIcon} tone="warning" />
        <StatCard label="Aktif öğrenci" value="64" icon={UsersIcon} />
        <StatCard label="Bu ay net" value={<MoneyText value={48250.5} />} icon={WalletIcon} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ders durumları</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Form</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ad">Ad Soyad</Label>
              <Input id="ad" placeholder="Ayşe Yılmaz" />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge>Matematik</Badge>
              <Badge variant="secondary">8 ders paketi</Badge>
              <span className="text-muted-foreground">
                {formatDateTime("2026-11-02T16:00:00Z")}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <EmptyState
          title="Henüz ders yok"
          description="Bu hafta için planlanmış ders bulunmuyor."
          action={<Button>+ Ders planla</Button>}
        />
      </section>
    </main>
  );
}
