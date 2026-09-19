import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/blog/slug";
import { POST_STATUSES, RELATED_LINK_TYPE_VALUES } from "@/lib/blog/types";
import { isSafeImageUrl, isSafeUrl } from "@/lib/landing/urls";

// Contrato (Zod) de tudo o que o painel do Blog grava. Toda gravação é validada no servidor.

const text = (max: number) => z.string().trim().max(max);
const slug = (max: number) => z.string().trim().min(1, "Informe o slug").max(max).regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífens");
const linkUrl = z.string().trim().max(500).refine(isSafeUrl, "Link inválido ou inseguro");
const requiredLinkUrl = linkUrl.refine((value) => value !== "", "Informe a URL");
const imageUrl = z.string().trim().max(700).refine(isSafeImageUrl, "Imagem inválida");
const dateOnly = z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"), z.literal("")]);
const id = z.string().min(1).max(60);

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(60),
  slug: slug(80),
  description: text(300),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida"),
  isActive: z.boolean(),
});

export const tagInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(40),
  slug: slug(60),
});

export const sourceSchema = z.object({
  id,
  title: z.string().trim().min(1, "Informe o título da fonte").max(200),
  publisher: text(120),
  author: text(120),
  url: linkUrl,
  publishedAt: dateOnly,
  accessedAt: dateOnly,
  notes: text(300),
});

export const relatedLinkSchema = z.object({
  id,
  title: z.string().trim().min(1, "Informe o título do link").max(120),
  url: requiredLinkUrl,
  description: text(200),
  type: z.enum(RELATED_LINK_TYPE_VALUES),
});

export const postInputSchema = z.object({
  title: z.string().trim().min(3, "O título precisa de pelo menos 3 caracteres").max(160),
  slug: slug(120),
  excerpt: text(300),
  content: z.unknown(),

  coverImageUrl: imageUrl,
  coverImageAlt: text(200),
  coverImageDecorative: z.boolean(),
  coverImageCaption: text(300),
  coverImageCredit: text(120),
  coverImageSourceUrl: linkUrl,

  status: z.enum(POST_STATUSES),
  /** ISO. Obrigatório para "scheduled"; em "published" vazio significa "agora". */
  publishedAt: z.union([z.string().datetime({ offset: true }), z.null()]),
  isFeatured: z.boolean(),
  categoryId: z.union([z.string().uuid(), z.null()]),
  tagIds: z.array(z.string().uuid()).max(20, "Use no máximo 20 tags"),

  authorName: z.string().trim().min(1, "Informe o nome do autor").max(120),
  authorRole: text(120),
  authorBio: text(400),
  authorAvatarUrl: imageUrl,

  sources: z.array(sourceSchema).max(40),
  relatedLinks: z.array(relatedLinkSchema).max(20),

  seoTitle: text(70),
  seoDescription: text(200),
  canonicalUrl: z.union([z.string().trim().url().max(300).startsWith("https://", "Use um endereço https://"), z.literal("")]),
  ogTitle: text(100),
  ogDescription: text(200),
  ogImageUrl: imageUrl,
  seoIndex: z.boolean(),
});

export type PostInput = z.infer<typeof postInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type TagInput = z.infer<typeof tagInputSchema>;
