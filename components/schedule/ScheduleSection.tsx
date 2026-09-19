"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type KeyboardEvent, useRef, useState } from "react";
import { REDUCED_MOTION } from "@/components/landing/animations";
import { ScheduleBlockCard } from "@/components/schedule/ScheduleBlockCard";
import type { PageHero, ScheduleDay } from "@/lib/landing/pages-schema";

gsap.registerPlugin(useGSAP);

type ScheduleSectionProps = { hero: PageHero; days: ScheduleDay[]; animated?: boolean };

export function ScheduleSection({ hero, days, animated = true }: ScheduleSectionProps) {
  const [selectedIndex, setActiveIndex] = useState(0);
  // No painel um dia pode ser excluído enquanto está selecionado.
  const activeIndex = Math.min(selectedIndex, days.length - 1);
  const sectionRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const activeDay = days[activeIndex];

  // Troca de dia: os blocos do novo dia entram em cascata.
  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (!animated || window.matchMedia(REDUCED_MOTION).matches) return;

      gsap.from(".schedule-block", {
        y: 36,
        autoAlpha: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: "all",
      });
    },
    { dependencies: [activeIndex], scope: sectionRef },
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (activeIndex + step + days.length) % days.length;
    setActiveIndex(nextIndex);
    sectionRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus();
  }

  return (
    <section className="schedule-section" id="programacao" ref={sectionRef}>
      <div className="schedule-hero">
        <div className="schedule-hero-content shell">
          {hero.eyebrow.trim() && <p className="eyebrow">{hero.eyebrow}</p>}
          <h1>{hero.title}</h1>
          {hero.lead.trim() && <p className="schedule-lead">{hero.lead}</p>}

          <div className="schedule-tabs" role="tablist" aria-label="Dias do evento" onKeyDown={handleKeyDown}>
            {days.map((day, index) => (
              <button
                type="button"
                role="tab"
                id={`tab-${day.id}`}
                aria-selected={index === activeIndex}
                aria-controls="schedule-panel"
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                key={day.id}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="schedule-panel shell"
        id="schedule-panel"
        role="tabpanel"
        aria-labelledby={`tab-${activeDay.id}`}
      >
        {activeDay.blocks.map((block) => (
          <ScheduleBlockCard block={block} key={block.id} />
        ))}
      </div>
    </section>
  );
}
