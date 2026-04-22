import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AIAssistant } from "@/components/common/ai-assistant";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Marketplace · Bénin",
    template: "%s · Marketplace",
  },
  description:
    "Marketplace multi-vendeurs au Bénin : achetez et vendez produits, services et ebooks. Paiement MTN MoMo, Moov Money, Celtiis Cash.",
  keywords: [
    "marketplace bénin",
    "achat en ligne bénin",
    "cotonou",
    "mtn momo",
    "moov money",
    "celtiis cash",
    "ebook",
    "services",
  ],
  openGraph: {
    title: "Marketplace · Bénin",
    description:
      "Achetez et vendez facilement au Bénin. Produits, services, ebooks. Paiement mobile.",
    type: "website",
    locale: "fr_BJ",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans pb-16 md:pb-0`}>
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <MobileBottomNav />
        <AIAssistant />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
