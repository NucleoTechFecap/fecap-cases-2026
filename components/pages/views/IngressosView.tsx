import { PageFrame } from "@/components/pages/PageFrame";
import { CmsSectionHead } from "@/components/pages/SectionHead";
import type { PageViewProps } from "@/components/pages/views/types";
import { safeHref } from "@/lib/landing/urls";

export function IngressosView({ config, animated }: PageViewProps) {
  const page = config.pages.ingressos;
  const ticketsUrl = safeHref(page.ticketsUrl);

  return (
    <PageFrame
      config={config}
      animated={animated}
      eyebrow={page.hero.eyebrow}
      title={page.hero.title}
      lead={page.hero.lead}
      heroActions={
        page.heroButtonLabel.trim() ? (
          <a className="button button-lime" href={ticketsUrl} target="_blank" rel="noreferrer">
            {page.heroButtonLabel}
          </a>
        ) : undefined
      }
      showCta={false}
    >
      {page.steps.length > 0 && (
        <section className="page-section">
          <div className="shell">
            <CmsSectionHead heading={page.stepsHeading} />

            <div className="card-grid card-grid-3" data-reveal-group>
              {page.steps.map((step) => (
                <article className="step-card" key={step.id}>
                  {step.tag && <span className="step-number">{step.tag}</span>}
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="page-section bg-blue">
        <div className="shell">
          <CmsSectionHead heading={page.nightsHeading} />

          {/* Um cartão por dia cadastrado na Programação. */}
          <div className="ticket-grid" data-reveal-group>
            {config.pages.programacao.days.map((day, index) => {
              const [name, date] = day.label.split(" — ");

              return (
                <article className="ticket-card" key={day.id}>
                  <div className="ticket-card-top">
                    <span>{name}</span>
                    {date && <strong>{date}</strong>}
                  </div>
                  <p>{page.nightTime.trim() || config.event.time}</p>
                  {page.nightBadge.trim() && <span className="ticket-badge">{page.nightBadge}</span>}
                  <a className="button button-lime" href={ticketsUrl} target="_blank" rel="noreferrer">
                    {page.nightButtonLabel}
                  </a>
                  {page.nightLinkLabel.trim() && (
                    <a className="ticket-link" href="/programacao">
                      {page.nightLinkLabel} {index + 1}
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell split-layout">
          <CmsSectionHead heading={page.notesHeading} />

          <ul className="check-list" data-reveal-group>
            {page.notes.map((note) => (
              <li key={note.id}>{note.text}</li>
            ))}
            {page.showHelpNote && (
              <li>
                Ficou com dúvida? Veja as <a href="/duvidas">perguntas frequentes</a> ou <a href="/contato">fale com a organização</a>.
              </li>
            )}
          </ul>
        </div>
      </section>
    </PageFrame>
  );
}
