import { blogListUrl } from "@/lib/blog/links";

type BlogPaginationProps = { page: number; pageCount: number; query: string; category: string; tag: string };

export function BlogPagination({ page, pageCount, ...filters }: BlogPaginationProps) {
  if (pageCount <= 1) return null;

  // Janela curta em volta da página atual, sempre com a primeira e a última.
  const pages = [...new Set([1, page - 1, page, page + 1, pageCount])].filter((item) => item >= 1 && item <= pageCount).sort((a, b) => a - b);

  return (
    <nav className="blog-pagination" aria-label="Paginação do blog">
      {page > 1 && (
        <a href={blogListUrl({ ...filters, page: page - 1 })} rel="prev">
          ← Anterior
        </a>
      )}
      {pages.map((item, index) => (
        <span key={item}>
          {index > 0 && item - pages[index - 1] > 1 && <span className="blog-pagination-gap">…</span>}
          <a href={blogListUrl({ ...filters, page: item })} aria-current={item === page ? "page" : undefined} aria-label={`Página ${item}`}>
            {item}
          </a>
        </span>
      ))}
      {page < pageCount && (
        <a href={blogListUrl({ ...filters, page: page + 1 })} rel="next">
          Próxima →
        </a>
      )}
    </nav>
  );
}
