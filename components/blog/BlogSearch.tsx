type BlogSearchProps = { query: string; category: string; tag: string };

/** Formulário GET puro: funciona sem JavaScript e mantém a busca na URL (compartilhável). */
export function BlogSearch({ query, category, tag }: BlogSearchProps) {
  return (
    <form className="blog-search" action="/blog" method="get" role="search">
      <label htmlFor="blog-search-input" className="blog-sr-only">
        Buscar no blog
      </label>
      <input id="blog-search-input" type="search" name="q" defaultValue={query} placeholder="Buscar no blog..." maxLength={80} autoComplete="off" />
      {category && <input type="hidden" name="categoria" value={category} />}
      {tag && <input type="hidden" name="tag" value={tag} />}
      <button type="submit" className="button button-navy">
        Buscar
      </button>
    </form>
  );
}
