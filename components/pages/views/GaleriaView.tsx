import { GalleryGrid } from "@/components/pages/GalleryGrid";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";
import type { DrivePreviews } from "@/lib/landing/drive";

/** `previews` vem pronto do servidor (site) ou de uma action do painel (preview); sem ele, os álbuns mostram só o botão. */
export function GaleriaView({ config, animated, previews = {} }: PageViewProps & { previews?: DrivePreviews }) {
  const page = config.pages.galeria;

  return (
    <PageFrame config={config} animated={animated} eyebrow={page.hero.eyebrow} title={page.hero.title} lead={page.hero.lead}>
      <section className="page-section">
        <div className="shell">
          <CmsSectionHead heading={page.heading} />
          <GalleryGrid days={page.days} previews={previews} buttonLabel={page.albumButtonLabel} emptyText={page.emptyText} />
        </div>
      </section>
    </PageFrame>
  );
}
