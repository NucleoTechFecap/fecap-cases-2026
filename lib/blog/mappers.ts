import { sanitizeDoc } from "@/lib/blog/content";
import { relatedLinkSchema, sourceSchema } from "@/lib/blog/schema";
import type { BlogCategory, BlogTag, PostCard, PostDetail, PostRelatedLink, PostSource, PostStatus } from "@/lib/blog/types";

// Linhas do Supabase → tipos do app. Uma única consulta traz categoria e tags (sem N+1).

export const CARD_SELECT =
  "id, title, slug, excerpt, cover_image_url, cover_image_alt, author_name, published_at, reading_minutes, is_featured, category:blog_categories(name, slug, color, is_active)";

export const DETAIL_SELECT = "*, category:blog_categories(name, slug, color, is_active), tags:blog_tags(id, name, slug)";

type Row = Record<string, unknown>;

const s = (value: unknown): string => (typeof value === "string" ? value : "");

function mapCategory(value: unknown): PostCard["category"] {
  const row = (Array.isArray(value) ? value[0] : value) as Row | null | undefined;
  if (!row || row.is_active === false) return null;
  return { name: s(row.name), slug: s(row.slug), color: s(row.color) };
}

export function toCategory(row: Row): BlogCategory {
  return { id: s(row.id), name: s(row.name), slug: s(row.slug), description: s(row.description), color: s(row.color), isActive: row.is_active !== false };
}

export function toTag(row: Row): BlogTag {
  return { id: s(row.id), name: s(row.name), slug: s(row.slug) };
}

export function toPostCard(row: Row): PostCard {
  return {
    id: s(row.id),
    title: s(row.title),
    slug: s(row.slug),
    excerpt: s(row.excerpt),
    coverImageUrl: s(row.cover_image_url),
    coverImageAlt: s(row.cover_image_alt),
    authorName: s(row.author_name),
    publishedAt: (row.published_at as string | null) ?? null,
    readingMinutes: Number(row.reading_minutes) || 1,
    isFeatured: row.is_featured === true,
    category: mapCategory(row.category),
  };
}

/** Itens JSONB inválidos são descartados em vez de quebrar a página. */
function parseList<T>(value: unknown, schema: { safeParse: (item: unknown) => { success: boolean; data?: unknown } }): T[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data as T] : [];
  });
}

export function toPostDetail(row: Row): PostDetail {
  return {
    ...toPostCard(row),
    content: sanitizeDoc(row.content_json),
    coverImageDecorative: row.cover_image_decorative === true,
    coverImageCaption: s(row.cover_image_caption),
    coverImageCredit: s(row.cover_image_credit),
    coverImageSourceUrl: s(row.cover_image_source_url),
    authorRole: s(row.author_role),
    authorBio: s(row.author_bio),
    authorAvatarUrl: s(row.author_avatar_url),
    tags: (Array.isArray(row.tags) ? (row.tags as Row[]) : []).map(toTag).sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    sources: parseList<PostSource>(row.sources, sourceSchema),
    relatedLinks: parseList<PostRelatedLink>(row.related_links, relatedLinkSchema),
    seoTitle: s(row.seo_title),
    seoDescription: s(row.seo_description),
    canonicalUrl: s(row.canonical_url),
    ogTitle: s(row.og_title),
    ogDescription: s(row.og_description),
    ogImageUrl: s(row.og_image_url),
    seoIndex: row.seo_index !== false,
    status: s(row.status) as PostStatus,
    updatedAt: s(row.updated_at),
  };
}
