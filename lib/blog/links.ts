import { safeHref } from "@/lib/landing/urls";

const EXTERNAL = /^https?:\/\//i;

/**
 * Atributos de um link vindo do painel: URL validada (insegura vira "#") e,
 * para endereços externos, SEMPRE nova aba com rel="noopener noreferrer".
 */
export function blogLinkProps(url: string | null | undefined, newTab = false) {
  const href = safeHref(url);
  const external = EXTERNAL.test(href);
  return external || newTab ? ({ href, target: "_blank", rel: "noopener noreferrer" } as const) : ({ href } as const);
}

export function blogListUrl(params: { query?: string; category?: string; tag?: string; page?: number }): string {
  const search = new URLSearchParams();
  if (params.query) search.set("q", params.query);
  if (params.category) search.set("categoria", params.category);
  if (params.tag) search.set("tag", params.tag);
  if (params.page && params.page > 1) search.set("pagina", String(params.page));
  const text = search.toString();
  return text ? `/blog?${text}` : "/blog";
}
