"use client";

import { useEffect } from "react";

/** Marca o header com data-scrolled para a "cor ao rolar" definida no painel. */
export function HeaderScrollState() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;

    const update = () => {
      header.dataset.scrolled = String(window.scrollY > 40);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return null;
}
