import { CmsButton } from "@/components/landing/cms/CmsButton";
import { SectionTitle } from "@/components/landing/cms/Multiline";
import { sectionVariables } from "@/lib/landing/derive";
import type { SectionOf } from "@/lib/landing/schema";

export function ScheduleTeaser({
  section,
}: {
  section: SectionOf<"schedule">;
}) {
  const { content } = section;

  return (
    <section
      className="schedule-teaser"
      data-section-id={section.id}
      style={sectionVariables(section.styles)}
    >
      <div className="shell schedule-teaser-layout">
        <div>
          {content.eyebrow.trim() && (
            <p className="eyebrow">{content.eyebrow}</p>
          )}
          <h2>
            <SectionTitle
              title={content.title}
              highlight={content.titleHighlight}
            />
          </h2>
          {content.description.trim() && <p>{content.description}</p>}
        </div>

        <CmsButton button={content.button} />
      </div>
    </section>
  );
}
