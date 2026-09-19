import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/ArticleView";
import { getPublicPost, getRelatedPosts } from "@/lib/blog/queries";
import { DEFAULT_OG_IMAGE } from "@/data/seo";
import { getSiteUrl } from "@/lib/blog/site";
import { SLUG_PATTERN } from "@/lib/blog/slug";
import { blogListUrl } from "@/lib/blog/links";
import { safeImage } from "@/lib/landing/urls";
import "../blog.css";

type Params = Promise<{ slug: string }>;

// ISR: cada artigo é gerado no primeiro acesso e fica em cache; salvar/publicar no painel invalida
// na hora (revalidatePath/revalidateTag) e os 60s cobrem a entrada de publicações agendadas.
export const revalidate = 60;
export const generateStaticParams = async () => [];

// Rascunhos, arquivadas e agendadas futuras não existem para o cliente anônimo (RLS) → 404.
const loadPost = (slug: string) => (SLUG_PATTERN.test(slug) && slug.length <= 120 ? getPublicPost(slug) : Promise.resolve(null));

const absolute = (siteUrl: string, url: string) => (url.startsWith("/") ? `${siteUrl}${url}` : url);

// Metadata SEMPRE a partir da publicação pública; campos de SEO vazios caem em título/resumo/capa.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Publicação não encontrada | FECAP Cases", robots: { index: false, follow: false } };

  const siteUrl = await getSiteUrl();
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const canonical = post.canonicalUrl || (siteUrl ? `${siteUrl}/blog/${post.slug}` : undefined);
  const image = safeImage(post.ogImageUrl) || safeImage(post.coverImageUrl);
  // Sem capa nem imagem de SEO, o artigo compartilha com a arte oficial do evento.
  const images = image ? [{ url: absolute(siteUrl, image), alt: post.coverImageAlt || undefined }] : [DEFAULT_OG_IMAGE];

  return {
    title: `${title} | Blog FECAP Cases`,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: { index: post.seoIndex, follow: true },
    openGraph: {
      type: "article",
      locale: "pt_BR",
      siteName: "FECAP Cases",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      url: canonical,
      images,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.authorName ? [post.authorName] : undefined,
      section: post.category?.name,
      tags: post.tags.map((tag) => tag.name),
    },
    twitter: {
      card: "summary_large_image",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      images: [image ? absolute(siteUrl, image) : DEFAULT_OG_IMAGE.url],
    },
  };
}

/** `<` escapado: o JSON nunca consegue fechar a tag <script>. */
const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const [related, siteUrl] = await Promise.all([getRelatedPosts(post.id), getSiteUrl()]);
  const url = siteUrl ? `${siteUrl}/blog/${post.slug}` : "";
  const image = safeImage(post.ogImageUrl) || safeImage(post.coverImageUrl);

  // Só entram campos que existem de fato — nada é inventado.
  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(post.excerpt ? { description: post.excerpt } : {}),
    ...(image ? { image: [absolute(siteUrl, image)] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    ...(post.authorName ? { author: { "@type": "Person", name: post.authorName, ...(post.authorRole ? { jobTitle: post.authorRole } : {}) } } : {}),
    ...(post.category ? { articleSection: post.category.name } : {}),
    ...(post.tags.length ? { keywords: post.tags.map((tag) => tag.name).join(", ") } : {}),
    ...(url ? { mainEntityOfPage: url, url } : {}),
  };

  const crumbs = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(post.category ? [{ name: post.category.name, path: blogListUrl({ category: post.category.slug }) }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: `${siteUrl}${crumb.path}` })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(article)} />
      {siteUrl && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumb)} />}
      <ArticleView post={post} related={related} shareUrl={url} />
    </>
  );
}
