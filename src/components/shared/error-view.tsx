"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SUPPORT_WHATSAPP_URL } from "@/lib/constants";

/** Panel bölümlerinde beklenmeyen hata ekranı (error.tsx) */
export function ErrorView({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Bir şeyler ters gitti</h1>
      <p className="mt-2 text-muted-foreground">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Tekrar deneyin; sorun devam ederse bize haber
        verin.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()} className="rounded-full">
          <RotateCcwIcon className="size-4" /> Tekrar dene
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer">
            WhatsApp destek
          </a>
        </Button>
      </div>
    </div>
  );
}
