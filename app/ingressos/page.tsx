import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { EVENT_CONFIG } from "@/data/fecapCases";
import { TICKET_NOTES, TICKET_STEPS } from "@/data/pages";
import { SCHEDULE_DAYS } from "@/data/schedule";

export const metadata: Metadata = {
  title: "Ingressos | FECAP Cases 2026",
  description: "Garanta gratuitamente o seu ingresso para as noites do FECAP Cases 2026 pela Sympla.",
};

export default function TicketsPage() {
  return (
    <PageShell
      eyebrow="INGRESSOS"
      title="Garanta o seu lugar"
      lead="A entrada é gratuita, mediante inscrição. Escolha as noites que quer acompanhar e retire o seu ingresso pela Sympla."
      heroActions={
        <a className="button button-lime" href={EVENT_CONFIG.ticketsUrl} target="_blank" rel="noreferrer">
          Inscrever-se na Sympla ↗
        </a>
      }
      showCta={false}
    >
      <section className="page-section">
        <div className="shell">
          <SectionHead
            eyebrow="PASSO A PASSO"
            title={
              <>
                TRÊS PASSOS ATÉ O <span>TEATRO</span>
              </>
            }
          />

          <div className="card-grid card-grid-3" data-reveal-group>
            {TICKET_STEPS.map((step) => (
              <article className="step-card" key={step.title}>
                <span className="step-number">{step.tag}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-blue">
        <div className="shell">
          <SectionHead
            eyebrow="ESCOLHA AS NOITES"
            title={
              <>
                UM INGRESSO
                <br />
                <span>PARA CADA DIA</span>
              </>
            }
            text="Cada noite tem workshops simultâneos, ativações culturais e duas palestras no Teatro."
          />

          <div className="ticket-grid" data-reveal-group>
            {SCHEDULE_DAYS.map((day, index) => {
              const [name, date] = day.label.split(" — ");

              return (
                <article className="ticket-card" key={day.id}>
                  <div className="ticket-card-top">
                    <span>{name}</span>
                    <strong>{date}</strong>
                  </div>
                  <p>17h45 às 22h40</p>
                  <span className="ticket-badge">Gratuito</span>
                  <a className="button button-lime" href={EVENT_CONFIG.ticketsUrl} target="_blank" rel="noreferrer">
                    Retirar ingresso ↗
                  </a>
                  <a className="ticket-link" href="/programacao">
                    Ver programação do dia {index + 1}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell split-layout">
          <SectionHead
            eyebrow="BOM SABER"
            title={
              <>
                ANTES DE
                <br />
                <span>SE INSCREVER</span>
              </>
            }
          />

          <ul className="check-list" data-reveal-group>
            {TICKET_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
            <li>
              Ficou com dúvida? Veja as <a href="/duvidas">perguntas frequentes</a> ou{" "}
              <a href="/contato">fale com a organização</a>.
            </li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
