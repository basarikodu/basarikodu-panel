import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Gelir-Gider" };

export default function Page() {
  return <ComingSoon title="Gelir-Gider" phase={5} />;
}
