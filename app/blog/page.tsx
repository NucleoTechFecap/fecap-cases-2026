import type { Metadata } from "next";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { getBlogTaxonomy, getFeaturedPost, listPublicPosts } from "@/lib/blog/queries";
import { DEFAULT_OG_IMAGE } from "@/data/seo";
import { getSiteUrl } from "@/lib/blog/site";
import "./blog.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? "";

function readParams(params: Record<string, string | string[] | undefined>) {
  return {
    query: first(params.q).trim().slice(0, 80),
    category: first(params.categoria).slice(0, 80),
    tag: first(params.tag).slice(0, 60),
    page: Math.max(1, Number.parseInt(first(params.pagina), 10) || 1),
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const filters = readParams(await searchParams);
  const siteUrl = await getSiteUrl();
  const isFiltered = Boolean(filters.query || filters.category || filters.tag || filters.page > 1);
  const description = "Artigos, bastidores e conteúdos do FECAP Cases sobre comunicação, mercado, carreira e inovação.";

  return {
    title: "Blog | FECAP Cases",
    description,
    alternates: siteUrl ? { canonical: `${siteUrl}/blog` } : undefined,
    // Resultados de busca/filtro não são indexados: evita conteúdo duplicado.
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", locale: "pt_BR", siteName: "FECAP Cases", title: "Blog FECAP Cases", description, url: siteUrl ? `${siteUrl}/blog` : undefined, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: "summary_large_image", title: "Blog FECAP Cases", description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = readParams(await searchParams);
  const isFiltered = Boolean(filters.query || filters.category || filters.tag);

  const [list, taxonomy, featured] = await Promise.all([
    listPublicPosts(filters),
    getBlogTaxonomy(),
    // O destaque só aparece na primeira página da listagem "limpa".
    isFiltered || filters.page > 1 ? Promise.resolve(null) : getFeaturedPost(),
  ]);

  const posts = featured ? list.posts.filter((post) => post.id !== featured.id) : list.posts;
  const activeCategory = taxonomy.categories.find((item) => item.slug === filters.category);

  return (
    <PageShell
      activeHref="/blog"
      eyebrow="BLOG"
      title="Blog FECAP Cases"
      lead="Conteúdos, bastidores e ideias de quem faz o FECAP Cases acontecer."
    >
      {featured && (
        <section className="page-section blog-featured-section">
          <div className="shell">
            <SectionHead eyebrow="EM ALTA" title={<span>DESTAQUES</span>} />
            <BlogHero post={featured} />
          </div>
        </section>
      )}

      <section className={`page-section ${featured ? "page-section-flush" : ""}`}>
        <div className="shell">
          <SectionHead
            eyebrow={isFiltered ? "RESULTADOS" : "NOVIDADES"}
            title={
              isFiltered ? (
                <>
                  {list.total} {list.total === 1 ? "PUBLICAÇÃO" : "PUBLICAÇÕES"}
                </>
              ) : (
                <>
                  ÚLTIMAS
                  <br />
                  <span>PUBLICAÇÕES</span>
                </>
              )
            }
            text={
              filters.query
                ? `Resultados para “${filters.query}”${activeCategory ? ` em ${activeCategory.name}` : ""}.`
                : activeCategory?.description || undefined
            }
          />

          <div className="blog-toolbar">
            <BlogSearch query={filters.query} category={filters.category} tag={filters.tag} />
            <BlogFilters categories={taxonomy.categories} tags={taxonomy.tags} {...filters} />
          </div>

          {posts.length > 0 ? (
            <BlogGrid posts={posts} />
          ) : !featured ? (
            <div className="blog-empty">
              <h3>{isFiltered ? "Nenhuma publicação encontrada." : "Em breve, novos conteúdos por aqui."}</h3>
              <p>{isFiltered ? "Tente outra palavra ou remova os filtros." : "Estamos preparando as primeiras publicações do blog."}</p>
              {isFiltered && (
                <a className="button button-navy" href="/blog">
                  Ver todas as publicações
                </a>
              )}
            </div>
          ) : null}

          <BlogPagination page={list.page} pageCount={list.pageCount} query={filters.query} category={filters.category} tag={filters.tag} />
        </div>
      </section>
    </PageShell>
  );
}
