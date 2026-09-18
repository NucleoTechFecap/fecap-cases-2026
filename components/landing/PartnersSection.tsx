import { SponsorGroup } from "@/components/landing/SponsorGroup";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import { sectionVariables } from "@/lib/landing/derive";
import type { SectionOf } from "@/lib/landing/schema";

export function PartnersSection({
  section,
}: {
  section: SectionOf<"partners">;
}) {
  const { content } = section;
  const categories = content.categories.filter((category) => category.active);

  return (
    <section
      className="partners-section"
      data-section-id={section.id}
      id="parceiros"
      style={sectionVariables(section.styles)}
    >
      {content.ribbonImage && (
        <div className="partner-ribbon-wrap">
          <CmsImage
            className="partner-ribbon"
            src={content.ribbonImage}
            alt={content.ribbonAlt}
            width={1920}
            height={505}
            sizes="100vw"
          />
        </div>
      )}

      <div className="shell sponsor-groups">
        {categories.map((category) => (
          <SponsorGroup
            category={category}
            partners={content.partners.filter(
              (partner) => partner.active && partner.categoryId === category.id,
            )}
            key={category.id}
          />
        ))}
      </div>
    </section>
  );
}
