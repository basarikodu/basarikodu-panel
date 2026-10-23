import { MessageCircleIcon } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CurrentProfile } from "@/lib/auth";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";
import { ROLE_LABEL } from "@/components/layout/nav-config";

export function ProfileView({ profile }: { profile: CurrentProfile }) {
  return (
    <>
      <PageHeader title="Profil" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bilgilerim</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <Row label="Ad Soyad" value={profile.fullName} />
            <Row label="E-posta" value={profile.email ?? "—"} />
            <Row label="Hesap türü" value={ROLE_LABEL[profile.role]} />
            <p className="text-xs text-muted-foreground">
              Bilgilerinizde değişiklik için BaşarıKodu ile iletişime geçin.
            </p>
            <Button asChild variant="outline" className="w-fit">
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">
                <MessageCircleIcon className="size-4" /> WhatsApp destek
              </a>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Şifre değiştir</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
