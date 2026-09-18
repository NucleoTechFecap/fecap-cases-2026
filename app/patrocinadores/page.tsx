import type { Metadata } from "next";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import { SponsorGroup } from "@/components/landing/SponsorGroup";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { SPONSOR_BENEFITS, SPONSOR_TIERS } from "@/data/pages";
import { defaultSection } from "@/lib/landing/defaults";
import { findSection } from "@/lib/landing/derive";
import { getPublishedLanding } from "@/lib/landing/queries";

export const metadata: Metadata = {
  title: "Patrocinadores | FECAP Cases 2026",
  description:
    "Marcas que apoiam o FECAP Cases 2026 e como se tornar patrocinador, apoiador ou parceiro do evento.",
};

export default async function SponsorsPage() {
  const { config } = await getPublishedLanding();
  const { content } =
    findSection(config, "partners") ?? defaultSection("partners");

  return (
    <PageShell
      activeHref="/patrocinadores"
      eyebrow="PATROCINADORES, APOIADORES & PARCEIROS"
      title="Quem caminha com a gente"
      lead="O FECAP Cases só acontece porque marcas e instituições acreditam na formação de novos talentos. Conheça quem apoia — e saiba como fazer parte."
      heroActions={
        <a className="button button-lime" href="/contato">
          Quero apoiar o evento
        </a>
      }
    >
      <section className="page-section page-section-flush">
        <div className="partner-ribbon-wrap" data-reveal>
          <CmsImage
            className="partner-ribbon"
            src={content.ribbonImage}
            alt={content.ribbonAlt}
            width={1920}
            height={505}
            sizes="100vw"
          />
        </div>

        <div className="shell sponsor-groups">
          {content.categories
            .filter((category) => category.active)
            .map((category) => (
              <div data-reveal key={category.id}>
                <SponsorGroup
                  category={category}
                  partners={content.partners.filter(
                    (partner) =>
                      partner.active && partner.categoryId === category.id,
                  )}
                />
              </div>
            ))}
        </div>
      </section>

      <section className="page-section bg-navy">
        <div className="shell">
          <SectionHead
            eyebrow="POR QUE APOIAR"
            title={
              <>
                SUA MARCA NA
                <br />
                <span>DIREÇÃO CERTA</span>
              </>
            }
            text="Quatro motivos para colocar a sua empresa dentro do maior evento de comunicação da FECAP."
          />

          <div className="card-grid card-grid-2" data-reveal-group>
            {SPONSOR_BENEFITS.map((benefit) => (
              <article className="info-card" key={benefit.title}>
                <span className="info-card-tag">{benefit.tag}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <SectionHead
            align="center"
            eyebrow="COTAS"
            title={
              <>
                TRÊS FORMAS DE <span>PARTICIPAR</span>
              </>
            }
            text="As contrapartidas são ajustadas com cada marca. Fale com a organização para receber o plano comercial."
          />

          <div className="card-grid card-grid-3" data-reveal-group>
            {SPONSOR_TIERS.map((tier) => (
              <article
                className={`tier-card tier-${tier.tone}`}
                key={tier.name}
              >
                <h3>{tier.name}</h3>
                <p>{tier.summary}</p>
                <ul>
                  {tier.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <a className="button" href="/contato">
                  Falar com a organização
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
