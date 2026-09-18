import { Countdown } from "@/components/Countdown";
import { CountdownVisibility } from "@/components/landing/CountdownVisibility";
import { Multiline } from "@/components/landing/cms/Multiline";
import { countdownTargetIso, sectionVariables } from "@/lib/landing/derive";
import type { EventConfig, SectionOf } from "@/lib/landing/schema";

type CountdownSectionProps = {
  section: SectionOf<"countdown">;
  event: EventConfig;
};

export function CountdownSection({ section, event }: CountdownSectionProps) {
  const { content } = section;
  const target = countdownTargetIso(
    content.targetDate,
    content.targetTime,
    event.timezone,
  );
  const finishedMessage =
    content.whenFinished === "custom"
      ? content.finishedMessage
      : content.whenFinished === "started"
        ? "Evento iniciado"
        : "";

  return (
    <section
      className="countdown-section"
      data-section-id={section.id}
      id="programacao"
      style={sectionVariables(section.styles, {
        "--cd-card": content.cardColor,
        "--cd-number": content.numberColor,
        "--cd-label": content.labelColor,
        "--cd-sep": content.separatorColor,
      })}
    >
      {content.whenFinished === "hide" && (
        <CountdownVisibility targetDate={target} />
      )}

      <div className="shell countdown-layout">
        <h2>
          <Multiline text={content.title} />
        </h2>
        <Countdown
          targetDate={target}
          labels={content.labels}
          finishedMessage={finishedMessage}
        />
      </div>
    </section>
  );
}
