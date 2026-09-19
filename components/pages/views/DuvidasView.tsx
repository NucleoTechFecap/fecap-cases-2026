import { FaqExplorer } from "@/components/pages/FaqExplorer";
import { PageButtonLink } from "@/components/pages/PageButtonLink";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";
import { defaultSection } from "@/lib/landing/defaults";
import { findSection } from "@/lib/landing/derive";

export function DuvidasView({ config, animated }: PageViewProps) {
  const page = config.pages.duvidas;
  const faq = findSection(config, "faq") ?? defaultSection("faq");
  const items = faq.content.items.filter((item) => item.active && item.question.trim());

  return (
    <PageFrame config={config} animated={animated} activeHref="/duvidas" eyebrow={page.hero.eyebrow} title={page.hero.title} lead={page.hero.lead}>
      <section className="page-section bg-orange">
        <div className="shell split-layout split-layout-faq">
          <div>
            <CmsSectionHead heading={page.heading} />

            <aside className="help-card" data-reveal>
              <h3>{page.helpTitle}</h3>
              <p>{page.helpText}</p>
              {config.event.email && <a href={`mailto:${config.event.email}`}>{config.event.email}</a>}
              <PageButtonLink className="button button-lime" button={page.helpButton} />
            </aside>
          </div>

          <div data-reveal>
            <FaqExplorer items={items} searchLabel={page.searchLabel} searchPlaceholder={page.searchPlaceholder} />
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
