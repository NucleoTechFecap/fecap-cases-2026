import { blogListUrl } from "@/lib/blog/links";
import type { BlogCategory, BlogTag } from "@/lib/blog/types";

type BlogFiltersProps = { categories: BlogCategory[]; tags: BlogTag[]; query: string; category: string; tag: string };

export function BlogFilters({ categories, tags, query, category, tag }: BlogFiltersProps) {
  const activeTag = tags.find((item) => item.slug === tag);

  return (
    <div className="blog-filters">
      {categories.length > 0 && (
        <nav className="gallery-filters blog-filter-row" aria-label="Filtrar por categoria">
          <a href={blogListUrl({ query, tag })} aria-current={category === "" ? "page" : undefined}>
            Todos
          </a>
          {categories.map((item) => (
            <a href={blogListUrl({ query, tag, category: item.slug })} aria-current={item.slug === category ? "page" : undefined} key={item.id}>
              {item.name}
            </a>
          ))}
        </nav>
      )}

      {activeTag && (
        <p className="blog-active-tag">
          Tag: <strong>#{activeTag.name}</strong>
          <a href={blogListUrl({ query, category })} aria-label={`Remover filtro da tag ${activeTag.name}`}>
            Remover ✕
          </a>
        </p>
      )}
    </div>
  );
}
