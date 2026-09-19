import type { Metadata } from "next";
import { FecapCasesLandingPage } from "@/components/landing";
import { getPublishedLanding } from "@/lib/landing/queries";
import { safeImage } from "@/lib/landing/urls";
import { getSiteUrl } from "@/lib/blog/site";
import { DEFAULT_OG_IMAGE, FECAP_CASES_KEYWORDS } from "@/data/seo";

// SEO vem da versão PUBLICADA (nunca do rascunho).
export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getPublishedLanding();
  const { seo, event } = config;

  const title = seo.title || event.name;
  const siteUrl = await getSiteUrl();
  const canonicalUrl = seo.canonicalUrl || siteUrl || undefined;
  // A imagem enviada pelo CMS tem prioridade; sem upload, vale a arte oficial (public/og-image.jpg).
  const cmsImage = safeImage(seo.ogImage);
  const alt = `${event.name} — ${seo.ogTitle || title}`;
  const ogImage = cmsImage ? { url: cmsImage, alt } : DEFAULT_OG_IMAGE;
  const twitterImage = safeImage(seo.twitterImage) || ogImage.url;
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
      images: [ogImage],
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
