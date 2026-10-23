import type { Metadata, Viewport } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "BaşarıKodu Panel",
    template: "%s · BaşarıKodu Panel",
  },
  description: "BaşarıKodu özel ders ve koçluk yönetim paneli",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1b2e6e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
