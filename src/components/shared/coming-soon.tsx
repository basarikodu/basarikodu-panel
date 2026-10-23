import { HammerIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

/** Henüz yapılmamış ekranlar için geçici içerik (PLAN.md'deki faz numarasıyla). */
export function ComingSoon({ title, phase }: { title: string; phase: number }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={HammerIcon}
        title="Bu bölüm hazırlanıyor"
        description={`Bu ekran Faz ${phase} kapsamında ekleniyor.`}
      />
    </>
  );
}
