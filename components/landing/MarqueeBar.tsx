import { defaultSection } from "@/lib/landing/defaults";
import { sectionVariables } from "@/lib/landing/derive";
import type { SectionOf } from "@/lib/landing/schema";

type MarqueeBarProps = {
  section?: SectionOf<"marquee">;
  decorative?: boolean;
};

export function MarqueeBar({
  section = defaultSection("marquee"),
  decorative = false,
}: MarqueeBarProps) {
  const { content } = section;
  const items = content.items.filter((item) => item.text.trim());
  if (items.length === 0) return null;

  const reverse = content.direction === "right";
  // Duas cópias da lista: o loop anda 50% e recomeça sem salto.
  const loop = content.animated ? [...items, ...items] : items;

  return (
    <div
      className={`marquee-bar ${reverse ? "marquee-bottom" : ""}`}
      aria-label={decorative ? undefined : "Temas do evento"}
      aria-hidden={decorative || undefined}
      data-animated={content.animated}
      data-section-id={section.id}
      style={sectionVariables(section.styles, {
        "--marquee-speed": `${content.speed}s`,
      })}
    >
      <div
        className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}
        data-speed={content.speed}
      >
        {loop.map((item, index) => (
          <span key={`${item.id}-${index}`}>✦ {item.text}</span>
        ))}
      </div>
    </div>
  );
}
