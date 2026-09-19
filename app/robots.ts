import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/blog/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = await getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin" }],
    sitemap: siteUrl ? `${siteUrl}/sitemap.xml` : undefined,
  };
}
