import { SOCIAL_LABELS } from "@/components/landing/cms/SocialIcon";
import { ContactSection } from "@/components/landing/ContactSection";
import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";
import { findSection, phoneHref } from "@/lib/landing/derive";
import { safeHref } from "@/lib/landing/urls";

export function ContatoView({ config, animated = true }: PageViewProps) {
  const page = config.pages.contato;
  const { event } = config;
  const contact = findSection(config, "contact");
  const mapsUrl = contact?.content.mapsUrl ?? "";

  return (
    <PageFrame
      config={config}
      animated={animated}
      activeHref="/contato"
      eyebrow={page.hero.eyebrow}
      title={page.hero.title}
      lead={page.hero.lead}
      showCta={false}
    >
      <section className="page-section">
        <div className="shell">
          <CmsSectionHead heading={page.heading} />

          <div className="card-grid card-grid-3" data-reveal-group>
            <a className="channel-card" href={`mailto:${event.email}`}>
              <span className="channel-icon" aria-hidden="true">
                ✉
              </span>
              <h3>{page.emailLabel}</h3>
              <p>{event.email}</p>
            </a>

            <a className="channel-card" href={phoneHref(event.phone)}>
              <span className="channel-icon" aria-hidden="true">
                ☎
              </span>
              <h3>{page.phoneLabel}</h3>
              <p>{event.phone}</p>
            </a>

            <a className="channel-card" href={safeHref(mapsUrl)} target="_blank" rel="noreferrer">
              <span className="channel-icon" aria-hidden="true">
                ⌖
              </span>
              <h3>{page.addressLabel}</h3>
              <p>{event.address}</p>
            </a>
          </div>

          <div className="social-strip" data-reveal>
            <strong>{page.socialTitle}</strong>
            <div>
              {config.social
                .filter((item) => item.active)
                .map((item) => (
                  <a href={safeHref(item.url)} key={item.id}>
                    {SOCIAL_LABELS[item.network]}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>

      <ContactSection section={contact} event={event} interactive={animated} />
    </PageFrame>
  );
}
