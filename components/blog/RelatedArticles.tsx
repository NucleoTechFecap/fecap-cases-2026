import { BlogGrid } from "@/components/blog/BlogGrid";
import { SectionHead } from "@/components/pages/SectionHead";
import type { PostCard } from "@/lib/blog/types";

export function RelatedArticles({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="page-section blog-related">
      <div className="shell">
        <SectionHead
          eyebrow="CONTINUE LENDO"
          title={
            <>
              CONTEÚDOS
              <br />
              <span>RELACIONADOS</span>
            </>
          }
        />
        <BlogGrid posts={posts} />
      </div>
    </section>
  );
}
