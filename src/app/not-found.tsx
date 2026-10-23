import { CompassIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <Logo />
      <span className="mt-10 grid size-14 place-items-center rounded-full bg-accent text-primary">
        <CompassIcon className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Button asChild className="mt-6 rounded-full">
        <Link href="/">Ana sayfaya dön</Link>
      </Button>
    </main>
  );
}
