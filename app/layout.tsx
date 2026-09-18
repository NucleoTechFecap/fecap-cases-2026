import type { Metadata } from "next";
import { Archivo, Inter, Poppins, Space_Grotesk } from "next/font/google";
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

export const metadata: Metadata = {
  title: "FECAP Cases 2026",
  description:
    "Landing page do FECAP Cases — conteúdo, experiências, conexões e cases que transformam.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <body>
        <noscript>
          <style>{".site-header,.hero-content>*,.schedule-hero-content>*,.page-hero-content>*{visibility:visible!important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
