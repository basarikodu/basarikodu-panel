import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { FormState } from "@/features/auth/actions";

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error) {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
      >
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-lg bg-success-soft p-3 text-sm text-success"
      >
        <CircleCheckIcon className="mt-0.5 size-4 shrink-0" />
        {state.success}
      </p>
    );
  }
  return null;
}
