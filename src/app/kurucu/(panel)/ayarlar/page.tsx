import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return <ComingSoon title="Ayarlar" phase={2} />;
}
