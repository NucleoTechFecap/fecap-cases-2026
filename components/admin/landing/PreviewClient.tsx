"use client";

import { useEffect, useState } from "react";
import { PREVIEW_MESSAGE, PREVIEW_READY } from "@/components/admin/landing/LandingPreview";
import { FecapCasesLandingPage } from "@/components/landing/FecapCasesLandingPage";
import { parseLandingConfig } from "@/lib/landing/parse";
import type { LandingConfig } from "@/lib/landing/schema";

/** Roda dentro do iframe: recebe o rascunho do editor e renderiza a landing real, sem GSAP. */
export function PreviewClient() {
  const [config, setConfig] = useState<LandingConfig | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== PREVIEW_MESSAGE) return;

      // O rascunho pode estar no meio de uma edição inválida: o parser tolerante evita quebrar o preview.
      setConfig(parseLandingConfig(event.data.config));

      const focus = event.data.focusSectionId as string | null;
      if (focus) {
        window.requestAnimationFrame(() => {
          const target =
            focus === "header" ? document.querySelector(".site-header") : focus === "footer" ? document.querySelector(".site-footer") : document.querySelector(`[data-section-id="${CSS.escape(focus)}"]`);
          target?.scrollIntoView({ block: "start", behavior: "smooth" });
        });
      }
    };

    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!config) return null;

  return (
    // No preview, links e formulários não navegam nem enviam nada.
    <div
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest("a")) event.preventDefault();
      }}
      onSubmitCapture={(event) => event.preventDefault()}
    >
      <FecapCasesLandingPage config={config} animated={false} />
    </div>
  );
}
