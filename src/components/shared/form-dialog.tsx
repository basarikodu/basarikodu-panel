"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ActionState } from "@/lib/action-state";

export type FormAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Bir Server Action'ı dialog içindeki formla çalıştırır. Başarılıysa toast gösterip kapanır;
 * `renderSuccess` ile sonuç (ör. geçici şifre) dialogda gösterilebilir.
 */
export function FormDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Kaydet",
  children,
  renderSuccess,
  wide = false,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: FormAction;
  submitLabel?: string;
  children: React.ReactNode;
  /** Verilirse başarıdan sonra dialog kapanmaz, bu içerik gösterilir */
  renderSuccess?: (state: NonNullable<ActionState>) => React.ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const result = await action(prev, formData);
      if (result?.success) {
        if (renderSuccess) {
          setShowResult(true);
        } else {
          toast.success(result.success);
          setOpen(false);
        }
      }
      return result;
    },
    undefined,
  );

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setShowResult(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={wide ? "sm:max-w-2xl" : "sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {showResult && state ? (
          <>
            {renderSuccess?.(state)}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Tamam</Button>
            </DialogFooter>
          </>
        ) : (
          <form action={formAction} className="grid max-h-[70vh] gap-4 overflow-y-auto px-0.5">
            {children}
            {state?.error && <FormMessage state={{ error: state.error }} />}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Vazgeç
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Kaydediliyor…" : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
