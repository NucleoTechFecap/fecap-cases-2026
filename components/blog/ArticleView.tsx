import { ArticleContent } from "@/components/blog/ArticleContent";
import { ArticleRelatedLinks, ArticleSources } from "@/components/blog/ArticleSources";
import { CategoryBadge, PostMeta } from "@/components/blog/BlogCard";
import { Breadcrumb, type Crumb } from "@/components/blog/Breadcrumb";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import { PageShell } from "@/components/pages/PageShell";
import { blogLinkProps, blogListUrl } from "@/lib/blog/links";
import type { PostCard, PostDetail } from "@/lib/blog/types";

type ArticleViewProps = {
  post: PostDetail;
  related: PostCard[];
  /** Endereço absoluto do artigo; vazio = o botão usa o endereço do navegador. */
  shareUrl: string;
  /** Faixa exibida apenas no preview do painel. */
  notice?: React.ReactNode;
};

/** A MESMA árvore é usada em /blog/[slug] e no preview do painel — o preview não tem visual próprio. */
export function ArticleView({ post, related, shareUrl, notice }: ArticleViewProps) {
  const crumbs: Crumb[] = [
    { label: "Início", href: "/" },
    { label: "Blog", href: "/blog" },
    ...(post.category ? [{ label: post.category.name, href: blogListUrl({ category: post.category.slug }) }] : []),
    { label: post.title },
  ];

  return (
    <PageShell
      activeHref="/blog"
      heroTop={<Breadcrumb items={crumbs} />}
      eyebrow={post.category ? <CategoryBadge category={post.category} /> : "BLOG"}
      title={post.title}
      lead={post.excerpt}
      heroActions={<PostMeta post={post} />}
    >
      {notice}

      <article className="page-section article">
        <div className="article-shell">
          {post.coverImageUrl && (
            <figure className="article-cover">
              <CmsImage
                src={post.coverImageUrl}
                alt={post.coverImageDecorative ? "" : post.coverImageAlt}
                width={1600}
                height={900}
                priority
                sizes="(max-width:1100px) 100vw, 1100px"
              />
              {(post.coverImageCaption || post.coverImageCredit) && (
                <figcaption>
                  {post.coverImageCaption && <span>{post.coverImageCaption}</span>}
                  {post.coverImageCredit && (
                    <small>
                      Crédito:{" "}
                      {post.coverImageSourceUrl ? <a {...blogLinkProps(post.coverImageSourceUrl)}>{post.coverImageCredit}</a> : post.coverImageCredit}
                    </small>
                  )}
                </figcaption>
              )}
            </figure>
          )}

          <div className="article-body">
            <ArticleContent doc={post.content} />

            {post.tags.length > 0 && (
              <ul className="article-tags" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag.id}>
                    <a href={blogListUrl({ tag: tag.slug })}>#{tag.name}</a>
                  </li>
                ))}
              </ul>
            )}

            <ArticleSources sources={post.sources} />
            <ArticleRelatedLinks links={post.relatedLinks} />

            {post.authorName && (
              <aside className="article-author" aria-label="Sobre o autor">
                {post.authorAvatarUrl && <CmsImage src={post.authorAvatarUrl} alt="" width={72} height={72} />}
                <div>
                  <strong>{post.authorName}</strong>
                  {post.authorRole && <span>{post.authorRole}</span>}
                  {post.authorBio && <p>{post.authorBio}</p>}
                </div>
              </aside>
            )}

            <ShareButtons title={post.title} url={shareUrl} />
          </div>
        </div>
      </article>

      <RelatedArticles posts={related} />
    </PageShell>
  );
}
