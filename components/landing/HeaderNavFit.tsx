"use client";

import { useEffect } from "react";

/** Se os links do menu não couberem na largura do header, marca data-nav-overflow e o site usa o menu ☰. */
export function HeaderNavFit() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const nav = header?.querySelector<HTMLElement>("nav");
    if (!header || !nav) return;

    const update = () => {
      // Mede com o menu visível; remover e recolocar o atributo no mesmo frame não pisca na tela.
      delete header.dataset.navOverflow;
      header.dataset.navOverflow = String(nav.scrollWidth > nav.clientWidth + 1);
    };

    update();
    document.fonts.ready.then(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return null;
}
