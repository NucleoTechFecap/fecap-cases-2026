import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/blog/queries";
import { getSiteUrl } from "@/lib/blog/site";
import { getPublishedLanding } from "@/lib/landing/queries";

export const revalidate = 60;

const STATIC_PATHS = ["", "/sobre", "/programacao", "/ingressos", "/patrocinadores", "/galeria", "/duvidas", "/contato", "/blog"];

// Só entram publicações visíveis ao público (cliente anônimo + RLS): rascunhos, arquivadas,
// agendadas futuras e as marcadas como "noindex" ficam de fora.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (await getSiteUrl()) || "http://localhost:3000";
  const [posts, { publishedAt }] = await Promise.all([getSitemapEntries(), getPublishedLanding()]);
  // A home muda quando a landing é publicada no CMS; as demais páginas não têm data própria.
  const homeModified = publishedAt ? new Date(publishedAt) : undefined;

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: path === "" ? homeModified : undefined,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: new Date(post.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
