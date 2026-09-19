import { CategoryBadge, PostMeta } from "@/components/blog/BlogCard";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import type { PostCard } from "@/lib/blog/types";

/** Publicação marcada como "destaque" no painel. */
export function BlogHero({ post }: { post: PostCard }) {
  const href = `/blog/${post.slug}`;

  return (
    <article className="blog-featured" data-reveal>
      <a className="blog-featured-media" href={href} tabIndex={-1} aria-hidden="true">
        {post.coverImageUrl ? (
          <CmsImage src={post.coverImageUrl} alt="" width={960} height={540} priority sizes="(max-width:1024px) 100vw, 55vw" />
        ) : (
          <span className="blog-card-placeholder">FECAP CASES</span>
        )}
      </a>

      <div className="blog-featured-body">
        <p className="blog-featured-flag">Destaque</p>
        {post.category && <CategoryBadge category={post.category} />}
        <h3>
          <a href={href}>{post.title}</a>
        </h3>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <PostMeta post={post} />
        <a className="button button-navy blog-featured-cta" href={href}>
          Ler publicação ↗
        </a>
      </div>
    </article>
  );
}
