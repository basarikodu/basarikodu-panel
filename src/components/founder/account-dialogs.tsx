"use client";

import { KeyRoundIcon, PowerIcon, PowerOffIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { FormDialog, type FormAction } from "@/components/shared/form-dialog";
import { TempPasswordResult } from "@/components/shared/temp-password-result";
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

/** Yeni hesap formu; başarıda geçici şifreyi gösterir. */
export function CreateAccountDialog({
  trigger,
  title,
  description,
  action,
  children,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  action: FormAction;
  children: React.ReactNode;
}) {
  return (
    <FormDialog
      wide
      trigger={trigger}
      title={title}
      description={description}
      action={action}
      submitLabel="Hesabı oluştur"
      renderSuccess={(state) => (
        <TempPasswordResult
          message={`${state.success}. Giriş bilgilerini kullanıcıya iletin.`}
          email={state.email}
          password={state.tempPassword ?? ""}
        />
      )}
    >
      {children}
    </FormDialog>
  );
}

/** Pasife al / aktif et ve şifre sıfırlama düğmeleri. */
export function AccountActions({
  email,
  isActive,
  onSetActive,
  onResetPassword,
}: {
  email: string | null;
  isActive: boolean;
  onSetActive: (active: boolean) => Promise<ActionState>;
  onResetPassword: () => Promise<ActionState>;
}) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  const run = (fn: () => Promise<ActionState>, after?: (s: ActionState) => void) =>
    startTransition(async () => {
      const state = await fn();
      if (state?.error) toast.error(state.error);
      else if (state?.success) {
        if (!state.tempPassword) toast.success(state.success);
        after?.(state);
      }
    });

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending || !isActive}
        onClick={() => run(onResetPassword, (s) => setPassword(s?.tempPassword ?? null))}
      >
        <KeyRoundIcon className="size-4" /> Şifre sıfırla
      </Button>
      {isActive ? (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => setConfirmOpen(true)}>
          <PowerOffIcon className="size-4" /> Pasife al
        </Button>
      ) : (
        <Button size="sm" disabled={pending} onClick={() => run(() => onSetActive(true))}>
          <PowerIcon className="size-4" /> Yeniden aktif et
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hesap pasife alınsın mı?</DialogTitle>
            <DialogDescription>
              Kullanıcı panele giriş yapamaz. Geçmiş dersleri ve kayıtları silinmez; istediğiniz
              zaman yeniden aktif edebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                run(
                  () => onSetActive(false),
                  () => setConfirmOpen(false),
                )
              }
            >
              Pasife al
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={password !== null} onOpenChange={(o) => !o && setPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni geçici şifre</DialogTitle>
          </DialogHeader>
          {password && (
            <TempPasswordResult
              message="Eski şifre artık geçersiz."
              email={email ?? undefined}
              password={password}
            />
          )}
          <DialogFooter>
            <Button onClick={() => setPassword(null)}>Tamam</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
