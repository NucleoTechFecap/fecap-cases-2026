import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { formatEventDates } from "@/lib/landing/derive";
import type { EventConfig } from "@/lib/landing/schema";

export function CtaBand({ event = DEFAULT_LANDING_CONFIG.event }: { event?: EventConfig }) {
  return (
    <section className="cta-band">
      <div className="shell cta-band-layout" data-reveal>
        <div>
          <p className="eyebrow">{event.location}</p>
          <h2>
            {formatEventDates(event)}
            <br />
            <span>ESCOLHA A SUA DIREÇÃO.</span>
          </h2>
        </div>

        <div className="cta-band-actions">
          <a className="button button-navy" href="/ingressos">
            Garantir ingresso ↗
          </a>
          <a className="button button-ghost" href="/programacao">
            Ver programação
          </a>
        </div>
      </div>
    </section>
  );
}
