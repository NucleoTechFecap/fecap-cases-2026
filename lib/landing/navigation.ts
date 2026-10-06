import { PAGE_LABELS, PAGE_PATHS, type PageKey } from "@/lib/landing/pages-schema";
import type { CmsLink } from "@/lib/landing/schema";

/** Todas as páginas do site na ordem padrão do menu: o início e as páginas internas cadastradas. */
export const SITE_PAGES: CmsLink[] = [
  { id: "page-inicio", label: "Início", url: "/", newTab: false, active: true },
  ...(Object.keys(PAGE_PATHS) as PageKey[]).map((key) => ({
    id: `page-${key}`,
    label: PAGE_LABELS[key],
    url: PAGE_PATHS[key],
    newTab: false,
    active: true,
  })),
];

export function isSitePage(url: string): boolean {
  return SITE_PAGES.some((page) => page.url === url);
}

/**
 * Garante que toda página do site esteja no menu. Uma página nova entra sozinha, antes do primeiro
 * link que vem depois dela na ordem padrão (ou no fim). Para tirá-la do site, o painel a desativa.
 */
export function withSitePages(links: CmsLink[]): CmsLink[] {
  const result = [...links];

  SITE_PAGES.forEach((page, index) => {
    if (result.some((link) => link.url === page.url)) return;

    const laterUrls = SITE_PAGES.slice(index + 1).map((later) => later.url);
    const position = result.findIndex((link) => laterUrls.includes(link.url));
    result.splice(position === -1 ? result.length : position, 0, page);
  });

  return result;
}
