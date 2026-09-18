import { AboutSection } from "@/components/landing/AboutSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { CountdownSection } from "@/components/landing/CountdownSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { LandingAnimations } from "@/components/landing/LandingAnimations";
import { MarqueeBar } from "@/components/landing/MarqueeBar";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { ScheduleTeaser } from "@/components/landing/ScheduleTeaser";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { designVariables } from "@/lib/landing/derive";
import type { LandingConfig, LandingSection } from "@/lib/landing/schema";

type LandingPageProps = {
  config?: LandingConfig;
  /** false no preview do painel: sem GSAP e sem envio de formulário. */
  animated?: boolean;
};

function renderSection(
  section: LandingSection,
  config: LandingConfig,
  index: number,
  animated: boolean,
) {
  switch (section.type) {
    case "hero":
      return (
        <HeroSection section={section} event={config.event} key={section.id} />
      );
    case "marquee":
      // A primeira faixa é anunciada a leitores de tela; as demais são decorativas.
      return (
        <MarqueeBar
          section={section}
          decorative={
            config.sections.findIndex(
              (item) => item.type === "marquee" && item.enabled,
            ) !== index
          }
          key={section.id}
        />
      );
    case "countdown":
      return (
        <CountdownSection
          section={section}
          event={config.event}
          key={section.id}
        />
      );
    case "about":
      return <AboutSection section={section} key={section.id} />;
    case "schedule":
      return <ScheduleTeaser section={section} key={section.id} />;
    case "partners":
      return <PartnersSection section={section} key={section.id} />;
    case "faq":
      return <FaqSection section={section} key={section.id} />;
    case "contact":
      return (
        <ContactSection
          section={section}
          event={config.event}
          interactive={animated}
          key={section.id}
        />
      );
  }
}

/** Mesma árvore para a landing pública (versão publicada) e para o preview do painel (rascunho). */
export function FecapCasesLandingPage({
  config = DEFAULT_LANDING_CONFIG,
  animated = true,
}: LandingPageProps) {
  return (
    <main
      data-cms
      data-animated={animated}
      data-heading-font={
        config.design.headingFont === "system"
          ? undefined
          : config.design.headingFont
      }
      style={designVariables(config.design)}
    >
      {animated && <LandingAnimations />}
      <SiteHeader header={config.header} social={config.social} />
      {config.sections.map((section, index) =>
        section.enabled
          ? renderSection(section, config, index, animated)
          : null,
      )}
      <SiteFooter footer={config.footer} social={config.social} />
    </main>
  );
}
