import type { Metadata } from "next";
import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata: Metadata = { title: "Derslerim" };

export default function Page() {
  return <ComingSoon title="Derslerim" phase={4} />;
}
