import { CmsImage } from "@/components/landing/cms/CmsImage";
import { SectionTitle } from "@/components/landing/cms/Multiline";
import { sectionVariables } from "@/lib/landing/derive";
import type { SectionOf } from "@/lib/landing/schema";

export function AboutSection({ section }: { section: SectionOf<"about"> }) {
  const { content } = section;

  return (
    <section
      className="about-section"
      data-section-id={section.id}
      id="sobre"
      style={sectionVariables(section.styles, {
        "--about-card": content.cardColor,
      })}
    >
      <div className="shell">
        <div className="about-card">
          {content.eyebrow.trim() && (
            <div className="about-kicker">{content.eyebrow}</div>
          )}

          <div className="about-copy-grid">
            <div>
              <h2>
                <SectionTitle
                  title={content.title}
                  highlight={content.titleHighlight}
                />
              </h2>
            </div>

            <p>{content.description}</p>
          </div>

          <CmsImage
            className="about-image"
            src={content.imageUrl}
            alt=""
            width={1052}
            height={340}
          />

          {content.stats.length > 0 && (
            <div className="stats-grid">
              {content.stats.map((stat) => (
                <div key={stat.id}>
                  <strong>{stat.value}</strong>
                  <span>
                    {stat.label}
                    {stat.description.trim() && (
                      <small>{stat.description}</small>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
