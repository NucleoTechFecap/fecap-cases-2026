import { PageButtonLink } from "@/components/pages/PageButtonLink";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";

export function SobreView({ config, animated }: PageViewProps) {
  const page = config.pages.sobre;

  return (
    <PageFrame
      config={config}
      animated={animated}
      activeHref="/sobre"
      eyebrow={page.hero.eyebrow}
      title={page.hero.title}
      lead={page.hero.lead}
      heroActions={
        <>
          <PageButtonLink className="button button-lime" button={page.primaryButton} />
          <PageButtonLink className="button button-outline" button={page.secondaryButton} />
        </>
      }
    >
      <section className="page-section">
        <div className="shell split-layout">
          <CmsSectionHead heading={page.introHeading} />

          <div className="prose" data-reveal-group>
            {page.intro.map((paragraph) => (
              <p key={paragraph.id}>{paragraph.text}</p>
            ))}
          </div>
        </div>

        {page.stats.length > 0 && (
          <div className="shell">
            <div className="stat-band" data-reveal-group>
              {page.stats.map((stat) => (
                <div key={stat.id}>
                  <strong data-count>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {page.pillars.length > 0 && (
        <section className="page-section bg-navy">
          <div className="shell">
            <CmsSectionHead heading={page.pillarsHeading} />

            <div className="card-grid" data-reveal-group>
              {page.pillars.map((pillar) => (
                <article className="info-card" key={pillar.id}>
                  {pillar.tag && <span className="info-card-tag">{pillar.tag}</span>}
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {page.flow.length > 0 && (
        <section className="page-section">
          <div className="shell split-layout">
            <CmsSectionHead heading={page.flowHeading} />

            <div className="flow">
              <span className="flow-line" aria-hidden="true" />
              <ol>
                {page.flow.map((step) => (
                  <li data-reveal key={step.id}>
                    <span className="flow-time">{step.time}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {page.team.length > 0 && (
        <section className="page-section bg-orange">
          <div className="shell">
            <CmsSectionHead heading={page.teamHeading} />

            <div className="card-grid card-grid-3" data-reveal-group>
              {page.team.map((item) => (
                <article className="info-card info-card-light" key={item.id}>
                  {item.tag && <span className="info-card-tag">{item.tag}</span>}
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </PageFrame>
  );
}
