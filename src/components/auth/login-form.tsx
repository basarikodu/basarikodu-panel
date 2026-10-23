"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/features/auth/actions";

export function LoginForm({
  gate,
  initialError,
}: {
  gate: "student" | "tutor" | "founder";
  initialError?: string;
}) {
  const [state, action, pending] = useActionState(
    signIn,
    initialError ? { error: initialError } : undefined,
  );

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="gate" value={gate} />
      <div className="grid gap-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Şifre</Label>
          <Link href="/sifremi-unuttum" className="text-xs text-primary hover:underline">
            Şifremi unuttum
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <FormMessage state={state} />
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
    </form>
  );
}
