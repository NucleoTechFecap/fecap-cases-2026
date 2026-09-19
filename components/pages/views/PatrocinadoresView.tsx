import { CmsImage } from "@/components/landing/cms/CmsImage";
import { SponsorGroup } from "@/components/landing/SponsorGroup";
import { PageButtonLink } from "@/components/pages/PageButtonLink";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";
import { defaultSection } from "@/lib/landing/defaults";
import { findSection } from "@/lib/landing/derive";

export function PatrocinadoresView({ config, animated }: PageViewProps) {
  const page = config.pages.patrocinadores;
  const { content } = findSection(config, "partners") ?? defaultSection("partners");

  return (
    <PageFrame
      config={config}
      animated={animated}
      activeHref="/patrocinadores"
      eyebrow={page.hero.eyebrow}
      title={page.hero.title}
      lead={page.hero.lead}
      heroActions={<PageButtonLink className="button button-lime" button={page.button} />}
    >
      <section className="page-section page-section-flush">
        <div className="partner-ribbon-wrap" data-reveal>
          <CmsImage className="partner-ribbon" src={content.ribbonImage} alt={content.ribbonAlt} width={1920} height={505} sizes="100vw" />
        </div>

        <div className="shell sponsor-groups">
          {content.categories
            .filter((category) => category.active)
            .map((category) => (
              <div data-reveal key={category.id}>
                <SponsorGroup category={category} partners={content.partners.filter((partner) => partner.active && partner.categoryId === category.id)} />
              </div>
            ))}
        </div>
      </section>

      {page.benefits.length > 0 && (
        <section className="page-section bg-navy">
          <div className="shell">
            <CmsSectionHead heading={page.benefitsHeading} />

            <div className="card-grid card-grid-2" data-reveal-group>
              {page.benefits.map((benefit) => (
                <article className="info-card" key={benefit.id}>
                  {benefit.tag && <span className="info-card-tag">{benefit.tag}</span>}
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.tiers.length > 0 && (
        <section className="page-section">
          <div className="shell">
            <CmsSectionHead align="center" heading={page.tiersHeading} />

            <div className="card-grid card-grid-3" data-reveal-group>
              {page.tiers.map((tier) => (
                <article className={`tier-card tier-${tier.tone}`} key={tier.id}>
                  <h3>{tier.name}</h3>
                  <p>{tier.summary}</p>
                  <ul>
                    {tier.perks.map((perk) => (
                      <li key={perk.id}>{perk.text}</li>
                    ))}
                  </ul>
                  <PageButtonLink className="button" button={tier.button} />
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageFrame>
  );
}
