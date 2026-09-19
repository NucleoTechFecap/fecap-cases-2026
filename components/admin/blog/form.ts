import { EMPTY_DOC, type RichDoc } from "@/lib/blog/content";
import type { PostInput } from "@/lib/blog/schema";

/** Estado do formulário da publicação (o mesmo contrato validado no servidor). */
export type PostForm = Omit<PostInput, "content"> & { content: RichDoc };

export type SetField = <K extends keyof PostForm>(key: K, value: PostForm[K]) => void;

export function emptyPostForm(authorName: string): PostForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: EMPTY_DOC,
    coverImageUrl: "",
    coverImageAlt: "",
    coverImageDecorative: false,
    coverImageCaption: "",
    coverImageCredit: "",
    coverImageSourceUrl: "",
    status: "draft",
    publishedAt: null,
    isFeatured: false,
    categoryId: null,
    tagIds: [],
    authorName,
    authorRole: "",
    authorBio: "",
    authorAvatarUrl: "",
    sources: [],
    relatedLinks: [],
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
    seoIndex: true,
  };
}
