import { FaqAccordion } from "@/components/FaqAccordion";
import { SectionTitle } from "@/components/landing/cms/Multiline";
import { sectionVariables } from "@/lib/landing/derive";
import type { SectionOf } from "@/lib/landing/schema";

export function FaqSection({ section }: { section: SectionOf<"faq"> }) {
  const { content } = section;
  const items = content.items.filter(
    (item) => item.active && item.question.trim(),
  );

  return (
    <section
      className="faq-section"
      data-section-id={section.id}
      id="faq"
      style={sectionVariables(section.styles)}
    >
      <svg
        className="faq-wave"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0H1440V60C1260 130 1080 140 900 95C720 50 540 20 360 60C220 92 100 105 0 85Z" />
      </svg>

      <div className="shell faq-layout">
        <div className="faq-intro">
          {content.eyebrow.trim() && (
            <p className="eyebrow">{content.eyebrow}</p>
          )}
          <h2>
            <SectionTitle
              title={content.title}
              highlight={content.titleHighlight}
            />
          </h2>
          <p>{content.description}</p>
        </div>

        <FaqAccordion items={items} />
      </div>
    </section>
  );
}
