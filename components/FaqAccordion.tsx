"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import type { FaqItem } from "@/data/fecapCases";

type FaqAccordionProps = {
  items: FaqItem[];
  initialOpenIndex?: number | null;
};

export function FaqAccordion({ items, initialOpenIndex = 0 }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  const listRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useGSAP(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(".faq-item.is-open .faq-answer", {
        height: 0,
        autoAlpha: 0,
        overflow: "hidden",
        duration: 0.45,
        ease: "power3.out",
        clearProps: "all",
      });
      gsap.from(".faq-item.is-open .faq-symbol", { rotation: -90, duration: 0.4, ease: "back.out(2)" });
    },
    { dependencies: [openIndex], scope: listRef },
  );

  return (
    <div className="faq-list" ref={listRef}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;

        return (
          <article className={`faq-item ${isOpen ? "is-open" : ""}`} key={item.question}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="faq-question">{item.question}</span>
              <span className="faq-symbol" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <div className="faq-answer" id={panelId} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
