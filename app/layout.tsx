import type { Metadata } from "next";
import { Archivo, Inter, Poppins, Space_Grotesk } from "next/font/google";
import { PageTransition } from "@/components/PageTransition";
import { FECAP_CASES_KEYWORDS } from "@/data/seo";
import "./globals.css";
import "./pages.css";
import "./cms.css";

// Variável com eixo de largura: usada expandida (font-stretch:125%) nos títulos display.
// Whitelist de fontes do CMS: só são baixadas pelo navegador quando o tema as utiliza.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", preload: false });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap", preload: false });

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-wide", display: "swap" });

// Necessário para URLs absolutas de canonical, Open Graph e Twitter em todas as rotas.
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "FECAP Cases 2026",
  description:
    "Landing page do FECAP Cases — conteúdo, experiências, conexões e cases que transformam.",
  keywords: [...FECAP_CASES_KEYWORDS],
  openGraph: { locale: "pt_BR", siteName: "FECAP Cases" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <body>
        <noscript>
          <style>{".site-header,.hero-content>*,.schedule-hero-content>*,.page-hero-content>*{visibility:visible!important}"}</style>
        </noscript>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
