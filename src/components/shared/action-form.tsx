"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/action-state";
import type { FormAction } from "./form-dialog";

/** Server Action formu: hata mesajı, gönderim düğmesi; başarıda toast + onSuccess. */
export function ActionForm({
  action,
  submitLabel = "Kaydet",
  submitVariant = "default",
  onSuccess,
  children,
  footer,
  className,
}: {
  action: FormAction;
  submitLabel?: string;
  submitVariant?: "default" | "destructive" | "outline";
  onSuccess?: (state: NonNullable<ActionState>) => void;
  children: React.ReactNode;
  /** Gönder düğmesinin yanına eklenecek düğmeler */
  footer?: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const result = await action(prev, fd);
    if (result?.success) {
      toast.success(result.success);
      onSuccess?.(result);
    }
    return result;
  }, undefined);

  return (
    <form action={formAction} className={cn("grid gap-4", className)}>
      {children}
      {state?.error && <FormMessage state={{ error: state.error }} />}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {footer}
        <Button type="submit" variant={submitVariant} disabled={pending}>
          {pending ? "Kaydediliyor…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
