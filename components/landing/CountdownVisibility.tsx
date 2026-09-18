"use client";

import { useEffect } from "react";

/** Comportamento "esconder ao terminar": oculta a seção inteira quando a data chega. */
export function CountdownVisibility({ targetDate }: { targetDate: string }) {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".countdown-section");
    if (!section) return;

    const target = new Date(targetDate).getTime();
    const update = () => {
      section.hidden = target <= Date.now();
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(timer);
      section.hidden = false;
    };
  }, [targetDate]);

  return null;
}
