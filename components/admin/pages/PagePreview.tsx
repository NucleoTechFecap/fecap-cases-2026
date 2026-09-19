"use client";

import { useEffect } from "react";
import type { PageTarget } from "@/components/admin/pages/PagesEditor";
import { PageFrame } from "@/components/pages/PageFrame";
import { ContatoView } from "@/components/pages/views/ContatoView";
import { DuvidasView } from "@/components/pages/views/DuvidasView";
import { GaleriaView } from "@/components/pages/views/GaleriaView";
import { IngressosView } from "@/components/pages/views/IngressosView";
import { PatrocinadoresView } from "@/components/pages/views/PatrocinadoresView";
import { ProgramacaoView } from "@/components/pages/views/ProgramacaoView";
import { SobreView } from "@/components/pages/views/SobreView";
import type { LandingConfig } from "@/lib/landing/schema";

/** Preview das páginas internas: os mesmos componentes do site, com o rascunho e sem GSAP. */
export function PagePreview({ target, config }: { target: PageTarget; config: LandingConfig }) {
  // A chamada final fica no fim da página: rola até ela ao abrir o editor.
  useEffect(() => {
    if (target === "cta") document.querySelector(".cta-band")?.scrollIntoView({ block: "center" });
    else window.scrollTo({ top: 0 });
  }, [target]);

  switch (target) {
    case "sobre":
    case "cta":
      return <SobreView config={config} animated={false} />;
    case "programacao":
      return <ProgramacaoView config={config} animated={false} />;
    case "patrocinadores":
      return <PatrocinadoresView config={config} animated={false} />;
    case "galeria":
      return <GaleriaView config={config} animated={false} />;
    case "ingressos":
      return <IngressosView config={config} animated={false} />;
    case "duvidas":
      return <DuvidasView config={config} animated={false} />;
    case "contato":
      return <ContatoView config={config} animated={false} />;
    case "blog": {
      const { hero } = config.pages.blog;
      return (
        <PageFrame config={config} animated={false} activeHref="/blog" eyebrow={hero.eyebrow} title={hero.title} lead={hero.lead}>
          <section className="page-section">
            <div className="shell">
              <p style={{ textAlign: "center", opacity: 0.6 }}>As publicações do Blog aparecem aqui.</p>
            </div>
          </section>
        </PageFrame>
      );
    }
  }
}
