import { CmsButton } from "@/components/landing/cms/CmsButton";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import { formatEventDates, sectionVariables } from "@/lib/landing/derive";
import type { EventConfig, SectionOf } from "@/lib/landing/schema";
import { safeImage } from "@/lib/landing/urls";

type HeroSectionProps = {
  section: SectionOf<"hero">;
  event: EventConfig;
};

export function HeroSection({ section, event }: HeroSectionProps) {
  const { content } = section;
  const backgroundImage = safeImage(content.backgroundImage);

  // Local e data vêm das configurações do evento, a menos que o hero tenha texto próprio.
  const location = content.locationLabel.trim() || event.location;
  const date = content.dateLabel.trim() || formatEventDates(event);

  return (
    <section
      className="hero"
      data-section-id={section.id}
      id="inicio"
      style={sectionVariables(section.styles, {
        "--hero-image": backgroundImage ? `url("${backgroundImage}")` : "none",
        "--hero-overlay": content.overlayColor,
        "--hero-overlay-opacity": String(content.overlayOpacity),
        "--hero-eyebrow": content.eyebrowColor,
      })}
    >
      <div className="hero-content shell">
        {content.eyebrow.trim() && (
          <p className="eyebrow hero-eyebrow">{content.eyebrow}</p>
        )}

        <div className="hero-lockup" aria-label={event.name}>
          <CmsImage
            className="hero-logo"
            src={content.logoUrl}
            alt={content.logoAlt}
            width={711}
            height={355}
            priority
          />
        </div>

        {content.title.trim() && (
          <h1 className="hero-title">{content.title}</h1>
        )}
        {content.description.trim() && (
          <p className="hero-description">{content.description}</p>
        )}

        <div className="hero-bottom-row">
          <div>
            <span>{location}</span>
            <strong>{date}</strong>
          </div>

          <div className="hero-cta-stack">
            <CmsButton button={content.secondaryButton} />
            <CmsButton button={content.primaryButton} />
          </div>
        </div>
      </div>
    </section>
  );
}
