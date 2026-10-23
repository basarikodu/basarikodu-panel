import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Genel Bakış" };

export default function Page() {
  return <ComingSoon title="Genel Bakış" phase={5} />;
}
