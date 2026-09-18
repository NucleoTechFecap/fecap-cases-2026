import type { CSSProperties } from "react";
import { CmsImage } from "@/components/landing/cms/CmsImage";
import type { SectionOf } from "@/lib/landing/schema";
import { safeHref } from "@/lib/landing/urls";

type PartnersContent = SectionOf<"partners">["content"];

type SponsorGroupProps = {
  category: PartnersContent["categories"][number];
  partners: PartnersContent["partners"];
};

export function SponsorGroup({ category, partners }: SponsorGroupProps) {
  return (
    <section
      className="sponsor-group"
      style={{ "--group-color": category.color } as CSSProperties}
    >
      <div className="sponsor-heading">
        <h3>{category.name}</h3>
        <span aria-hidden="true" />
      </div>

      <div className="logo-grid">
        {partners.length > 0
          ? partners.map((partner) => {
              const logo = partner.logoUrl ? (
                <CmsImage
                  src={partner.logoUrl}
                  alt={partner.name}
                  width={240}
                  height={84}
                />
              ) : (
                <span className="logo-tile-name">{partner.name}</span>
              );

              return partner.website ? (
                <a
                  className="logo-tile"
                  href={safeHref(partner.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={partner.description || partner.name}
                  key={partner.id}
                >
                  {logo}
                </a>
              ) : (
                <div
                  className="logo-tile"
                  title={partner.description || partner.name}
                  key={partner.id}
                >
                  {logo}
                </div>
              );
            })
          : Array.from({ length: category.placeholders }).map((_, index) => (
              <div className="logo-placeholder" key={`${category.id}-${index}`}>
                <span>LOGO</span>
              </div>
            ))}
      </div>
    </section>
  );
}
