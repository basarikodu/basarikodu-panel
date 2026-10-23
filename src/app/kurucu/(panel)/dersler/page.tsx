import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Dersler" };

export default function Page() {
  return <ComingSoon title="Dersler" phase={5} />;
}
