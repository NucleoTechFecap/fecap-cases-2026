import type { Metadata } from "next";

/** Termos institucionais sempre presentes, mesmo se o CMS tiver keywords antigas. */
export const FECAP_CASES_KEYWORDS = [
  "FECAP Cases 2026",
  "FECAP Cases",
  "Direções",
  "evento de comunicação",
  "evento universitário",
  "comunicação",
  "publicidade e propaganda",
  "marketing",
  "criatividade",
  "inovação",
  "palestras",
  "workshops",
  "networking",
  "FECAP",
  "São Paulo",
] as const;

/**
 * Arte oficial de compartilhamento: a peça inteira (sem corte), 1200 × 628, ~180 KB.
 * Leve de propósito — o WhatsApp ignora imagens pesadas. O original fica em public/og-image.png.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 628,
  type: "image/jpeg",
  alt: "FECAP Cases 2026 — Direções: caminhos que transformam. FECAP, São Paulo, 19 a 23 de outubro de 2026.",
} as const;

/** Domínio oficial do evento (o endereço sem "www" redireciona para este). */
export const PRODUCTION_ORIGIN = "https://www.fecapcases.com.br";

/**
 * Origem usada para montar URLs absolutas (og:image, canonical, sitemap). Os robôs do WhatsApp/LinkedIn
 * precisam de um endereço PÚBLICO: o VERCEL_URL (endereço do deploy) é protegido por login e, sem
 * nenhuma variável, o Next cai em "localhost". Por isso, em produção, vale o domínio oficial mesmo
 * que NEXT_PUBLIC_SITE_URL não tenha sido configurada no Vercel.
 */
export const ENV_SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_ENV === "production" ? PRODUCTION_ORIGIN : "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
).replace(/\/+$/, "");

/** Metadata das páginas internas: título, descrição, canonical e o cartão completo de compartilhamento. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "pt_BR", siteName: "FECAP Cases", title, description, url: path, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [DEFAULT_OG_IMAGE.url] },
  };
}
