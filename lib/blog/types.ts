import type { RichDoc } from "@/lib/blog/content";

export const POST_STATUSES = ["draft", "published", "scheduled", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  scheduled: "Agendado",
  archived: "Arquivado",
};

/**
 * Status real de uma publicação: "scheduled" cuja data já passou JÁ está no ar
 * (a regra vive no banco, em blog_post_is_public — não depende de cron).
 */
export function effectiveStatus(status: PostStatus, publishedAt: string | null, now = Date.now()): PostStatus {
  if (status === "scheduled" && publishedAt && new Date(publishedAt).getTime() <= now) return "published";
  return status;
}

// Todo o Blog trabalha no horário de Brasília (sem horário de verão desde 2019).
export const BLOG_TIMEZONE = "America/Sao_Paulo";
export const BLOG_TIMEZONE_OFFSET = "-03:00";
export const BLOG_TIMEZONE_LABEL = "Horário de Brasília (GMT-3)";

export function formatPostDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: BLOG_TIMEZONE });
}

export function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: BLOG_TIMEZONE });
}

/** ISO → campos <input type="date"> / <input type="time"> no fuso do Blog. */
export function toDateTimeFields(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: BLOG_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  const [date, time] = parts.split(" ");
  return { date, time: time.slice(0, 5) };
}

export function fromDateTimeFields(date: string, time: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const parsed = new Date(`${date}T${time}:00${BLOG_TIMEZONE_OFFSET}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export type BlogCategory = { id: string; name: string; slug: string; description: string; color: string; isActive: boolean };
export type BlogTag = { id: string; name: string; slug: string };

export type PostSource = {
  id: string;
  title: string;
  publisher: string;
  author: string;
  url: string;
  publishedAt: string;
  accessedAt: string;
  notes: string;
};

export const RELATED_LINK_TYPES = [
  { value: "more", label: "Saiba mais" },
  { value: "docs", label: "Documentação" },
  { value: "official", label: "Site oficial" },
  { value: "signup", label: "Inscrição" },
  { value: "event", label: "Evento relacionado" },
] as const;

export const RELATED_LINK_TYPE_VALUES = ["more", "docs", "official", "signup", "event"] as const satisfies readonly (typeof RELATED_LINK_TYPES)[number]["value"][];
export type RelatedLinkType = (typeof RELATED_LINK_TYPES)[number]["value"];
export type PostRelatedLink = { id: string; title: string; url: string; description: string; type: RelatedLinkType };

/** Card de listagem (site e painel). */
export type PostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  authorName: string;
  publishedAt: string | null;
  readingMinutes: number;
  isFeatured: boolean;
  category: Pick<BlogCategory, "name" | "slug" | "color"> | null;
};

/** Publicação completa, como a página do artigo (e o preview) consomem. */
export type PostDetail = PostCard & {
  content: RichDoc;
  coverImageDecorative: boolean;
  coverImageCaption: string;
  coverImageCredit: string;
  coverImageSourceUrl: string;
  authorRole: string;
  authorBio: string;
  authorAvatarUrl: string;
  tags: BlogTag[];
  sources: PostSource[];
  relatedLinks: PostRelatedLink[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  seoIndex: boolean;
  status: PostStatus;
  updatedAt: string;
};
