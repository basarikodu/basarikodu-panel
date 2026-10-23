import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Öğrencilerim" };

export default function Page() {
  return <ComingSoon title="Öğrencilerim" phase={3} />;
}
