"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";

type SessionState = "checking" | "ready" | "missing";

export default function SetPasswordPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>("checking");
  const [state, action, pending] = useActionState(updatePassword, undefined);

  // Davet bağlantısı varsayılan şablonda token'ları URL'nin # kısmında getirir.
  useEffect(() => {
    const supabase = createClient();
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    const init = async () => {
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState(null, "", window.location.pathname);
      }
      const { data } = await supabase.auth.getUser();
      setSession(data.user ? "ready" : "missing");
    };
    void init();
  }, []);

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => router.replace("/"), 1200);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  return (
    <AuthCard
      title="Şifreni belirle"
      description="BaşarıKodu paneline giriş için bir şifre oluştur."
      footer={
        <Link href="/" className="hover:underline">
          ← Ana sayfa
        </Link>
      }
    >
      {session === "checking" && (
        <p className="text-sm text-muted-foreground">Bağlantı doğrulanıyor…</p>
      )}
      {session === "missing" && (
        <FormMessage
          state={{
            error:
              "Bağlantı geçersiz veya süresi dolmuş. Şifremi unuttum sayfasından yeni bağlantı isteyin.",
          }}
        />
      )}
      {session === "ready" && (
        <form action={action} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="password">Yeni şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="confirm">Yeni şifre (tekrar)</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <FormMessage state={state} />
          <Button type="submit" size="lg" disabled={pending || Boolean(state?.success)}>
            {pending ? "Kaydediliyor…" : "Şifreyi kaydet"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
