import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Öğrenciler" };

export default function Page() {
  return <ComingSoon title="Öğrenciler" phase={2} />;
}
