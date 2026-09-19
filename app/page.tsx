import type { Metadata } from "next";
import { FecapCasesLandingPage } from "@/components/landing";
import { getPublishedLanding } from "@/lib/landing/queries";
import { safeImage } from "@/lib/landing/urls";
import { getSiteUrl } from "@/lib/blog/site";
import { FECAP_CASES_KEYWORDS } from "@/data/seo";

// SEO vem da versão PUBLICADA (nunca do rascunho).
export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getPublishedLanding();
  const { seo, event } = config;

  const title = seo.title || event.name;
  const siteUrl = await getSiteUrl();
  const canonicalUrl = seo.canonicalUrl || siteUrl || undefined;
  // A imagem do CMS tem prioridade; sem upload, a rota /opengraph-image gera a arte de marca.
  const ogImage = safeImage(seo.ogImage) || "/opengraph-image";
  const twitterImage = safeImage(seo.twitterImage) || ogImage;
  const metadataBase = siteUrl ? new URL(siteUrl) : undefined;

  return {
    metadataBase,
    title,
    description: seo.description,
    keywords: [...new Set([...FECAP_CASES_KEYWORDS, ...seo.keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean)])],
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots: { index: seo.index, follow: seo.follow },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: event.name,
      title: seo.ogTitle || title,
      description: seo.ogDescription || seo.description,
      url: canonicalUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${event.name} — ${seo.ogTitle || title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || title,
      description: seo.ogDescription || seo.description,
      images: [twitterImage],
    },
  };
}

export default async function HomePage() {
  const { config } = await getPublishedLanding();
  return <FecapCasesLandingPage config={config} />;
}
