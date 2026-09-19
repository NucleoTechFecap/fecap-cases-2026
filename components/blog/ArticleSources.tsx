import { blogLinkProps } from "@/lib/blog/links";
import { type PostRelatedLink, type PostSource, RELATED_LINK_TYPES } from "@/lib/blog/types";

const formatDate = (value: string) => (value ? value.split("-").reverse().join("/") : "");

export function ArticleSources({ sources }: { sources: PostSource[] }) {
  if (sources.length === 0) return null;

  return (
    <section className="article-block" aria-labelledby="article-sources-title">
      <h2 id="article-sources-title">Fontes e referências</h2>
      <ol className="article-sources">
        {sources.map((source) => {
          const label = [source.publisher, source.title].filter(Boolean).join(" — ");
          const details = [
            source.author,
            source.publishedAt && `Publicado em ${formatDate(source.publishedAt)}`,
            source.accessedAt && `Acesso em ${formatDate(source.accessedAt)}`,
          ].filter(Boolean);

          return (
            <li key={source.id}>
              {source.url ? <a {...blogLinkProps(source.url)}>{label}</a> : <span>{label}</span>}
              {details.length > 0 && <small>{details.join(" · ")}</small>}
              {source.notes && <small>{source.notes}</small>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ArticleRelatedLinks({ links }: { links: PostRelatedLink[] }) {
  if (links.length === 0) return null;

  return (
    <section className="article-block" aria-labelledby="article-links-title">
      <h2 id="article-links-title">Links relacionados</h2>
      <ul className="article-links">
        {links.map((link) => (
          <li key={link.id}>
            <a {...blogLinkProps(link.url)}>
              <span className="article-link-type">{RELATED_LINK_TYPES.find((item) => item.value === link.type)?.label ?? "Saiba mais"}</span>
              <strong>{link.title} ↗</strong>
              {link.description && <small>{link.description}</small>}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
