export type Crumb = { label: string; href?: string };

/** Navegação estrutural com marcação semântica (nav + ol + aria-current). O JSON-LD fica na página. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="blog-breadcrumb" aria-label="Você está em">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? <a href={item.href}>{item.label}</a> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
