"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/features/auth/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <AuthCard
      title="Şifremi unuttum"
      description="E-posta adresinize şifre yenileme bağlantısı gönderelim."
      footer={
        <Link href="/giris" className="hover:underline">
          ← Girişe dön
        </Link>
      }
    >
      <form action={action} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <FormMessage state={state} />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Gönderiliyor…" : "Bağlantı gönder"}
        </Button>
      </form>
    </AuthCard>
  );
}
