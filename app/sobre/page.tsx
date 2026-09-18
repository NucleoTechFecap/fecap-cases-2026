import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";
import { EVENT_STATS } from "@/data/fecapCases";
import {
  ABOUT_INTRO,
  ABOUT_PILLARS,
  ABOUT_TEAM,
  NIGHT_FLOW,
} from "@/data/pages";

export const metadata: Metadata = {
  title: "Sobre | FECAP Cases 2026",
  description:
    "Conheça o FECAP Cases 2026 — Direções: o que é, como funciona cada noite e quem faz o evento.",
};

export default function AboutPage() {
  return (
    <PageShell
      activeHref="/sobre"
      eyebrow="SOBRE O EVENTO"
      title="Mas por que Direções?"
      lead="Cinco noites de conteúdo, cultura e conexões para quem quer entender para onde a comunicação está indo — e escolher o próprio caminho."
      heroActions={
        <>
          <a className="button button-lime" href="/programacao">
            Ver programação
          </a>
          <a className="button button-outline" href="/ingressos">
            Garantir ingresso ↗
          </a>
        </>
      }
    >
      <section className="page-section">
        <div className="shell split-layout">
          <SectionHead
            eyebrow="O EVENTO"
            title={
              <>
                CAMINHOS QUE
                <br />
                <span>TRANSFORMAM</span>
              </>
            }
          />

          <div className="prose" data-reveal-group>
            {ABOUT_INTRO.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="shell">
          <div className="stat-band" data-reveal-group>
            {EVENT_STATS.map((stat) => (
              <div key={stat.label}>
                <strong data-count>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-navy">
        <div className="shell">
          <SectionHead
            eyebrow="PILARES"
            title={
              <>
                O QUE VOCÊ
                <br />
                <span>VAI ENCONTRAR</span>
              </>
            }
            text="Seis frentes que se cruzam durante toda a semana — dentro e fora do palco."
          />

          <div className="card-grid" data-reveal-group>
            {ABOUT_PILLARS.map((pillar) => (
              <article className="info-card" key={pillar.title}>
                <span className="info-card-tag">{pillar.tag}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="shell split-layout">
          <SectionHead
            eyebrow="COMO FUNCIONA"
            title={
              <>
                O ROTEIRO DE
                <br />
                <span>CADA NOITE</span>
              </>
            }
            text="Todas as noites seguem a mesma estrutura. Os nomes e temas de cada dia estão na programação completa."
          />

          <div className="flow">
            <span className="flow-line" aria-hidden="true" />
            <ol>
              {NIGHT_FLOW.map((step) => (
                <li data-reveal key={step.time}>
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

      <section className="page-section bg-orange">
        <div className="shell">
          <SectionHead
            eyebrow="QUEM FAZ"
            title={
              <>
                DE ALUNOS
                <br />
                <span>PARA O MERCADO</span>
              </>
            }
          />

          <div className="card-grid card-grid-3" data-reveal-group>
            {ABOUT_TEAM.map((item) => (
              <article className="info-card info-card-light" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
