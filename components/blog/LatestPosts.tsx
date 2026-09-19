import { BlogGrid } from "@/components/blog/BlogGrid";
import { SectionHead } from "@/components/pages/SectionHead";
import { getLatestPosts } from "@/lib/blog/queries";

/**
 * Bloco "Conteúdos recentes" pronto para a landing ou para qualquer página interna:
 *   <LatestPosts />            → 3 publicações
 *   <LatestPosts limit={6} />
 * Sem publicações no ar o bloco não renderiza nada (a página não ganha uma seção vazia).
 */
export async function LatestPosts({ limit = 3 }: { limit?: number }) {
  const posts = await getLatestPosts(limit);
  if (posts.length === 0) return null;

  return (
    <section className="page-section blog-latest" id="blog">
      <div className="shell">
        <SectionHead
          eyebrow="BLOG"
          title={
            <>
              CONTEÚDOS
              <br />
              <span>RECENTES</span>
            </>
          }
        />
        <BlogGrid posts={posts} />
        <p className="blog-latest-more">
          <a className="button button-navy" href="/blog">
            Ver todos os artigos ↗
          </a>
        </p>
      </div>
    </section>
  );
}
