import type { Metadata } from "next";
import { pageMetadata } from "@/data/seo";
import { DEFAULT_PAGES } from "@/lib/landing/pages-defaults";
import { PAGE_PATHS, type PageKey } from "@/lib/landing/pages-schema";
import { getPublishedLanding } from "@/lib/landing/queries";

/** Título e descrição (Google e compartilhamento) de uma página interna, conforme publicado no painel. */
export async function cmsPageMetadata(key: PageKey): Promise<Metadata> {
  const { config } = await getPublishedLanding();
  const { seo } = config.pages[key];

  return pageMetadata({
    title: seo.title.trim() || DEFAULT_PAGES[key].seo.title,
    description: seo.description.trim() || DEFAULT_PAGES[key].seo.description,
    path: PAGE_PATHS[key],
  });
}
