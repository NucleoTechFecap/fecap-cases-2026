import { unstable_cache } from "next/cache";
import { CARD_SELECT, DETAIL_SELECT, toCategory, toPostCard, toPostDetail, toTag } from "@/lib/blog/mappers";
import type { BlogCategory, BlogTag, PostCard, PostDetail } from "@/lib/blog/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

// Leitura pública do Blog: sempre com o cliente ANÔNIMO. O RLS só entrega o que está no ar
// (publicado, ou agendado cuja data já chegou) — rascunhos e arquivados não existem para estas consultas.

export const BLOG_CACHE_TAG = "blog";
export const BLOG_PAGE_SIZE = 9;

// Revalidação curta: é o atraso máximo para uma publicação agendada aparecer sem ninguém tocar no painel.
const CACHE = { tags: [BLOG_CACHE_TAG], revalidate: 60 };

export type PostListParams = { query?: string; category?: string; tag?: string; page?: number };
export type PostList = { posts: PostCard[]; total: number; page: number; pageCount: number };

// Sem tipos gerados do banco, o supabase-js não sabe que a função devolve uma lista (setof).
const rowsOf = (data: unknown): Record<string, unknown>[] => (Array.isArray(data) ? data : []);

const EMPTY_LIST: PostList = { posts: [], total: 0, page: 1, pageCount: 1 };

const fetchPosts = unstable_cache(
  async (query: string, category: string, tag: string, page: number): Promise<PostList> => {
    const from = (page - 1) * BLOG_PAGE_SIZE;
    const { data, count, error } = await createPublicClient()
      .rpc("search_blog_posts", { p_query: query, p_category: category, p_tag: tag }, { count: "exact" })
      .select(CARD_SELECT)
      .order("published_at", { ascending: false })
      .range(from, from + BLOG_PAGE_SIZE - 1);
    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return { posts: rowsOf(data).map(toPostCard), total, page, pageCount: Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE)) };
  },
  ["blog-posts"],
  CACHE,
);

const fetchFeatured = unstable_cache(
  async (): Promise<PostCard | null> => {
    const { data, error } = await createPublicClient()
      .from("blog_posts")
      .select(CARD_SELECT)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    return data?.[0] ? toPostCard(data[0]) : null;
  },
  ["blog-featured"],
  CACHE,
);

const fetchLatest = unstable_cache(
  async (limit: number): Promise<PostCard[]> => {
    const { data, error } = await createPublicClient()
      .from("blog_posts")
      .select(CARD_SELECT)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toPostCard);
  },
  ["blog-latest"],
  CACHE,
);

const fetchPost = unstable_cache(
  async (slug: string): Promise<PostDetail | null> => {
    const { data, error } = await createPublicClient().from("blog_posts").select(DETAIL_SELECT).eq("slug", slug).limit(1);
    if (error) throw new Error(error.message);
    return data?.[0] ? toPostDetail(data[0]) : null;
  },
  ["blog-post"],
  CACHE,
);

const fetchRelated = unstable_cache(
  async (postId: string): Promise<PostCard[]> => {
    const { data, error } = await createPublicClient().rpc("related_blog_posts", { p_post_id: postId, p_limit: 3 }).select(CARD_SELECT);
    if (error) throw new Error(error.message);
    return rowsOf(data).map(toPostCard);
  },
  ["blog-related"],
  CACHE,
);

const fetchTaxonomy = unstable_cache(
  async (): Promise<{ categories: BlogCategory[]; tags: BlogTag[] }> => {
    const client = createPublicClient();
    const [categories, tags] = await Promise.all([
      client.from("blog_categories").select("*").eq("is_active", true).order("name"),
      client.from("blog_tags").select("id, name, slug").order("name").limit(200),
    ]);
    if (categories.error || tags.error) throw new Error(categories.error?.message ?? tags.error?.message);
    return { categories: (categories.data ?? []).map(toCategory), tags: (tags.data ?? []).map(toTag) };
  },
  ["blog-taxonomy"],
  CACHE,
);

const fetchSitemapEntries = unstable_cache(
  async (): Promise<{ slug: string; updatedAt: string }[]> => {
    const { data, error } = await createPublicClient()
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("seo_index", true)
      .order("published_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  },
  ["blog-sitemap"],
  CACHE,
);

/** O Blog nunca derruba o site: sem Supabase (ou com ele fora do ar) as páginas mostram o estado vazio. */
async function safely<T>(label: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!isSupabaseConfigured) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error(`[blog] Falha ao carregar ${label}.`, error);
    return fallback;
  }
}

export function listPublicPosts({ query = "", category = "", tag = "", page = 1 }: PostListParams = {}): Promise<PostList> {
  const safePage = Number.isInteger(page) && page > 0 ? Math.min(page, 500) : 1;
  return safely("as publicações", EMPTY_LIST, () => fetchPosts(query.trim().slice(0, 80), category.slice(0, 80), tag.slice(0, 60), safePage));
}

export const getFeaturedPost = () => safely("o destaque", null, fetchFeatured);
export const getLatestPosts = (limit = 3) => safely("as últimas publicações", [] as PostCard[], () => fetchLatest(Math.min(Math.max(limit, 1), 12)));
export const getPublicPost = (slug: string) => safely("a publicação", null, () => fetchPost(slug));
export const getRelatedPosts = (postId: string) => safely("os relacionados", [] as PostCard[], () => fetchRelated(postId));
export const getBlogTaxonomy = () => safely("categorias e tags", { categories: [] as BlogCategory[], tags: [] as BlogTag[] }, fetchTaxonomy);
export const getSitemapEntries = () => safely("o sitemap", [] as { slug: string; updatedAt: string }[], fetchSitemapEntries);
