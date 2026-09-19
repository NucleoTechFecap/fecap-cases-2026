import { GalleryGrid } from "@/components/pages/GalleryGrid";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";

export function GaleriaView({ config, animated }: PageViewProps) {
  const page = config.pages.galeria;

  return (
    <PageFrame config={config} animated={animated} eyebrow={page.hero.eyebrow} title={page.hero.title} lead={page.hero.lead}>
      <section className="page-section">
        <div className="shell">
          <CmsSectionHead heading={page.heading} />
          <GalleryGrid items={page.items.filter((item) => item.active)} categories={page.categories} allLabel={page.allLabel} />
        </div>
      </section>
    </PageFrame>
  );
}
