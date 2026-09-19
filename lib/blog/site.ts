import { getPublishedLanding } from "@/lib/landing/queries";

/**
 * Endereço público do site (sem barra final), para canonical, Open Graph, sitemap e JSON-LD.
 * Ordem: NEXT_PUBLIC_SITE_URL › URL canônica definida no SEO da landing › "" (URLs relativas).
 */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const { config } = await getPublishedLanding();
  try {
    return config.seo.canonicalUrl ? new URL(config.seo.canonicalUrl).origin : "";
  } catch {
    return "";
  }
}
