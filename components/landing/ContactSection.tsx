import { ContactForm } from "@/components/ContactForm";
import { DEFAULT_LANDING_CONFIG, defaultSection } from "@/lib/landing/defaults";
import { phoneHref, sectionVariables } from "@/lib/landing/derive";
import type { EventConfig, SectionOf } from "@/lib/landing/schema";
import { safeHref } from "@/lib/landing/urls";

type ContactSectionProps = {
  section?: SectionOf<"contact">;
  event?: EventConfig;
  /** No preview do painel o formulário não envia nada. */
  interactive?: boolean;
};

export function ContactSection({
  section = defaultSection("contact"),
  event = DEFAULT_LANDING_CONFIG.event,
  interactive = true,
}: ContactSectionProps) {
  const { content } = section;
  const address = content.addressLabel.trim() || event.address;

  return (
    <section
      className="contact-section"
      data-section-id={section.id}
      id="contato"
      style={sectionVariables(section.styles)}
    >
      <div className="shell contact-layout">
        <div className="contact-copy">
          <h2>{content.title}</h2>
          <p>{content.description}</p>

          <div className="contact-lines">
            {content.showEmail && event.email && (
              <a href={`mailto:${event.email}`}>✉ {event.email}</a>
            )}
            {content.showPhone && event.phone && (
              <a href={phoneHref(event.phone)}>☎ {event.phone}</a>
            )}
            {content.whatsapp && (
              <a
                href={safeHref(content.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                ✆ WhatsApp
              </a>
            )}
            {content.showAddress &&
              address &&
              (content.mapsUrl ? (
                <a
                  href={safeHref(content.mapsUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ⌖ {address}
                </a>
              ) : (
                <span>⌖ {address}</span>
              ))}
          </div>
        </div>

        <ContactForm texts={content.form} interactive={interactive} />
      </div>
    </section>
  );
}
