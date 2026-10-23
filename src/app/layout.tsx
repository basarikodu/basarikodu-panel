import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Tüm panel (gövde ve başlıklar) Montserrat; latin-ext Türkçe karakterler için
const montserrat = Montserrat({
  variable: "--font-montserrat",
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
  themeColor: "#0b3478",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
