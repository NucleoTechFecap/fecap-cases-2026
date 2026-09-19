import type { LandingConfig } from "@/lib/landing/schema";

/** As páginas internas recebem a configuração pronta: publicada no site, rascunho no preview do painel. */
export type PageViewProps = {
  config: LandingConfig;
  /** false no preview do painel: sem GSAP e sem envio de formulário. */
  animated?: boolean;
};
