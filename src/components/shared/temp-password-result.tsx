"use client";

import { CheckIcon, CopyIcon, KeyRoundIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Yeni hesap / şifre sıfırlama sonrası geçici şifreyi bir kez gösterir. */
export function TempPasswordResult({
  message,
  email,
  password,
}: {
  message: string;
  email?: string;
  password: string;
}) {
  const [copied, setCopied] = useState(false);
  const text = `BaşarıKodu Panel girişi\n${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/giris\nE-posta: ${email ?? ""}\nGeçici şifre: ${password}\nİlk girişten sonra Profil sayfasından şifreni değiştir.`;

  return (
    <div className="grid gap-4">
      <p className="rounded-lg bg-success-soft p-3 text-sm text-success">{message}</p>
      <div className="rounded-xl border bg-muted/50 p-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <KeyRoundIcon className="size-4" /> Geçici şifre (yalnızca şimdi görünür)
        </p>
        <p className="mt-2 font-mono text-xl font-bold tracking-wider select-all">{password}</p>
        {email && <p className="mt-1 text-sm text-muted-foreground">{email}</p>}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        }}
      >
        {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        {copied ? "Kopyalandı" : "Giriş bilgilerini kopyala (WhatsApp için)"}
      </Button>
    </div>
  );
}
