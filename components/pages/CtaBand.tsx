import { PageButtonLink } from "@/components/pages/PageButtonLink";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { formatEventDates } from "@/lib/landing/derive";
import type { PagesConfig } from "@/lib/landing/pages-schema";
import type { EventConfig } from "@/lib/landing/schema";

type CtaBandProps = { event?: EventConfig; cta?: PagesConfig["cta"] };

export function CtaBand({ event = DEFAULT_LANDING_CONFIG.event, cta = DEFAULT_LANDING_CONFIG.pages.cta }: CtaBandProps) {
  return (
    <section className="cta-band">
      <div className="shell cta-band-layout" data-reveal>
        <div>
          <p className="eyebrow">{event.location}</p>
          <h2>
            {formatEventDates(event)}
            {cta.highlight.trim() && (
              <>
                <br />
                <span>{cta.highlight}</span>
              </>
            )}
          </h2>
        </div>

        <div className="cta-band-actions">
          <PageButtonLink className="button button-navy" button={cta.primaryButton} />
          <PageButtonLink className="button button-ghost" button={cta.secondaryButton} />
        </div>
      </div>
    </section>
  );
}
