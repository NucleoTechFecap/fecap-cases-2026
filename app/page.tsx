import type { Metadata } from "next";
import { FecapCasesLandingPage } from "@/components/landing";
import { getPublishedLanding } from "@/lib/landing/queries";
import { safeImage } from "@/lib/landing/urls";

// SEO vem da versão PUBLICADA (nunca do rascunho).
export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getPublishedLanding();
  const { seo, event } = config;

  const title = seo.title || event.name;
  const ogImage = safeImage(seo.ogImage);
  const twitterImage = safeImage(seo.twitterImage) || ogImage;
  const metadataBase = seo.canonicalUrl ? new URL(seo.canonicalUrl) : undefined;

  return {
    metadataBase,
    title,
    description: seo.description,
    keywords: seo.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: { index: seo.index, follow: seo.follow },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: event.name,
      title: seo.ogTitle || title,
      description: seo.ogDescription || seo.description,
      url: seo.canonicalUrl || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: twitterImage ? "summary_large_image" : "summary",
      title: seo.ogTitle || title,
      description: seo.ogDescription || seo.description,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const { config } = await getPublishedLanding();
  return <FecapCasesLandingPage config={config} />;
}
