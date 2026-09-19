import type { Metadata } from "next";
import { Archivo, Inter, Poppins, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PageTransition } from "@/components/PageTransition";
import { DEFAULT_OG_IMAGE, ENV_SITE_ORIGIN, FECAP_CASES_KEYWORDS } from "@/data/seo";
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
const siteOrigin = ENV_SITE_ORIGIN || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: "FECAP Cases 2026",
  description:
    "Landing page do FECAP Cases — conteúdo, experiências, conexões e cases que transformam.",
  keywords: [...FECAP_CASES_KEYWORDS],
  // Padrão de todas as rotas; cada página sobrescreve com título/descrição próprios.
  openGraph: { type: "website", locale: "pt_BR", siteName: "FECAP Cases", images: [DEFAULT_OG_IMAGE] },
  twitter: { card: "summary_large_image", images: [DEFAULT_OG_IMAGE.url] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <body>
        <noscript>
          <style>{".site-header,.hero-content>*,.schedule-hero-content>*,.page-hero-content>*{visibility:visible!important}"}</style>
        </noscript>
        <PageTransition>{children}</PageTransition>
        <Analytics />
      </body>
    </html>
  );
}
