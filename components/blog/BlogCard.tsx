import { CmsImage } from "@/components/landing/cms/CmsImage";
import { blogListUrl } from "@/lib/blog/links";
import { type PostCard, formatPostDate } from "@/lib/blog/types";

type BlogCardProps = { post: PostCard; headingLevel?: "h2" | "h3"; priority?: boolean };

export function PostMeta({ post }: { post: Pick<PostCard, "authorName" | "publishedAt" | "readingMinutes"> }) {
  return (
    <p className="blog-meta">
      {post.authorName && <span>Por {post.authorName}</span>}
      {post.publishedAt && <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}
      <span>{post.readingMinutes} min de leitura</span>
    </p>
  );
}

export function CategoryBadge({ category }: { category: NonNullable<PostCard["category"]> }) {
  return (
    <a className="blog-category" href={blogListUrl({ category: category.slug })} style={{ "--category": category.color } as React.CSSProperties}>
      {category.name}
    </a>
  );
}

export function BlogCard({ post, headingLevel: Heading = "h3", priority }: BlogCardProps) {
  const href = `/blog/${post.slug}`;

  return (
    <article className="blog-card">
      <a className="blog-card-media" href={href} tabIndex={-1} aria-hidden="true">
        {post.coverImageUrl ? (
          <CmsImage src={post.coverImageUrl} alt="" width={640} height={360} priority={priority} sizes="(max-width:720px) 100vw, 33vw" />
        ) : (
          <span className="blog-card-placeholder">FECAP CASES</span>
        )}
      </a>

      <div className="blog-card-body">
        {post.category && <CategoryBadge category={post.category} />}
        <Heading>
          <a href={href}>{post.title}</a>
        </Heading>
        {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
        <PostMeta post={post} />
      </div>
    </article>
  );
}
