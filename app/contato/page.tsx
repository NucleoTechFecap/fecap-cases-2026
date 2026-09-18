import type { Metadata } from "next";
import { ContactSection } from "@/components/landing/ContactSection";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { SOCIAL_LABELS } from "@/components/landing/cms/SocialIcon";
import { findSection, phoneHref } from "@/lib/landing/derive";
import { getPublishedLanding } from "@/lib/landing/queries";
import { safeHref } from "@/lib/landing/urls";

export const metadata: Metadata = {
  title: "Contato | FECAP Cases 2026",
  description:
    "Fale com a organização do FECAP Cases 2026: e-mail, telefone, endereço e formulário de contato.",
};

export default async function ContactPage() {
  const { config } = await getPublishedLanding();
  const { event } = config;
  const contact = findSection(config, "contact");
  const mapsUrl = contact?.content.mapsUrl ?? "";

  return (
    <PageShell
      activeHref="/contato"
      eyebrow="CONTATO"
      title="Vamos conversar?"
      lead="Compartilhe conosco sua experiência, ideias, sugestões ou comentários. Quer participar, apoiar ou saber mais? É por aqui."
      showCta={false}
    >
      <section className="page-section">
        <div className="shell">
          <SectionHead
            eyebrow="CANAIS OFICIAIS"
            title={
              <>
                FALE COM A <span>ORGANIZAÇÃO</span>
              </>
            }
          />

          <div className="card-grid card-grid-3" data-reveal-group>
            <a className="channel-card" href={`mailto:${event.email}`}>
              <span className="channel-icon" aria-hidden="true">
                ✉
              </span>
              <h3>E-mail</h3>
              <p>{event.email}</p>
            </a>

            <a className="channel-card" href={phoneHref(event.phone)}>
              <span className="channel-icon" aria-hidden="true">
                ☎
              </span>
              <h3>Telefone</h3>
              <p>{event.phone}</p>
            </a>

            <a
              className="channel-card"
              href={safeHref(mapsUrl)}
              target="_blank"
              rel="noreferrer"
            >
              <span className="channel-icon" aria-hidden="true">
                ⌖
              </span>
              <h3>Como chegar</h3>
              <p>{event.address}</p>
            </a>
          </div>

          <div className="social-strip" data-reveal>
            <strong>Acompanhe nas redes</strong>
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

      <ContactSection section={contact} event={event} />
    </PageShell>
  );
}
