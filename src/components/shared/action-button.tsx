"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionState } from "@/lib/action-state";

/** Bağlanmış (bind) bir Server Action'ı onay sorusuyla çalıştıran düğme. */
export function ActionButton({
  action,
  children,
  confirmTitle,
  confirmText,
  confirmLabel = "Onayla",
  destructive = false,
  ...button
}: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  confirmTitle?: string;
  confirmText?: string;
  confirmLabel?: string;
  destructive?: boolean;
} & Omit<React.ComponentProps<typeof Button>, "onClick" | "action">) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const run = () =>
    startTransition(async () => {
      const state = await action();
      if (state?.error) toast.error(state.error);
      else if (state?.success) toast.success(state.success);
      setOpen(false);
    });

  return (
    <>
      <Button
        {...button}
        disabled={pending || button.disabled}
        onClick={() => (confirmTitle ? setOpen(true) : run())}
      >
        {children}
      </Button>
      {confirmTitle && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmTitle}</DialogTitle>
              {confirmText && <DialogDescription>{confirmText}</DialogDescription>}
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Vazgeç
              </Button>
              <Button
                variant={destructive ? "destructive" : "default"}
                disabled={pending}
                onClick={run}
              >
                {confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
