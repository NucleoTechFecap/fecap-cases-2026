import { ENV_SITE_ORIGIN } from "@/data/seo";
import { getPublishedLanding } from "@/lib/landing/queries";

/**
 * Endereço público do site (sem barra final), para canonical, Open Graph, sitemap e JSON-LD.
 * Ordem: NEXT_PUBLIC_SITE_URL › URL canônica do SEO da landing › domínio de produção no Vercel › "".
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const { config } = await getPublishedLanding();
  try {
    if (config.seo.canonicalUrl) return new URL(config.seo.canonicalUrl).origin;
  } catch {
    // URL canônica inválida no CMS: cai no domínio do ambiente.
  }
  return ENV_SITE_ORIGIN;
}
