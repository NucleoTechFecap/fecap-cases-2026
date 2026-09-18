import type { Metadata } from "next";
import { FaqExplorer } from "@/components/pages/FaqExplorer";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { defaultSection } from "@/lib/landing/defaults";
import { findSection } from "@/lib/landing/derive";
import { getPublishedLanding } from "@/lib/landing/queries";

export const metadata: Metadata = {
  title: "Dúvidas | FECAP Cases 2026",
  description:
    "Perguntas frequentes sobre inscrição, horários, workshops e certificados do FECAP Cases 2026.",
};

export default async function FaqPage() {
  const { config } = await getPublishedLanding();
  const faq = findSection(config, "faq") ?? defaultSection("faq");
  const items = faq.content.items.filter(
    (item) => item.active && item.question.trim(),
  );

  return (
    <PageShell
      activeHref="/duvidas"
      eyebrow="FAQ"
      title="Você pergunta e a gente responde"
      lead="Reunimos as principais dúvidas para você chegar ao evento sabendo como funciona cada etapa."
    >
      <section className="page-section bg-orange">
        <div className="shell split-layout split-layout-faq">
          <div>
            <SectionHead
              eyebrow="PERGUNTAS FREQUENTES"
              title={
                <>
                  TUDO O QUE
                  <br />
                  <span>VOCÊ PRECISA SABER</span>
                </>
              }
            />

            <aside className="help-card" data-reveal>
              <h3>Não achou a resposta?</h3>
              <p>A organização responde pelos canais oficiais do evento.</p>
              {config.event.email && (
                <a href={`mailto:${config.event.email}`}>
                  {config.event.email}
                </a>
              )}
              <a className="button button-lime" href="/contato">
                Enviar uma mensagem
              </a>
            </aside>
          </div>

          <div data-reveal>
            <FaqExplorer items={items} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
