import { ContactSection } from "@/components/landing/ContactSection";
import { MarqueeBar } from "@/components/landing/MarqueeBar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import type { PageViewProps } from "@/components/pages/views/types";
import { ScheduleAnimations } from "@/components/schedule/ScheduleAnimations";
import { ScheduleSection } from "@/components/schedule/ScheduleSection";
import { designVariables, findSection } from "@/lib/landing/derive";

export function ProgramacaoView({ config, animated = true }: PageViewProps) {
  const page = config.pages.programacao;
  const marquee = findSection(config, "marquee");
  const contact = findSection(config, "contact");

  return (
    <main
      data-cms
      data-animated={animated}
      data-heading-font={config.design.headingFont === "system" ? undefined : config.design.headingFont}
      style={designVariables(config.design)}
    >
      {animated && <ScheduleAnimations />}
      <SiteHeader header={config.header} social={config.social} activeHref="/programacao" />
      <ScheduleSection hero={page.hero} days={page.days} animated={animated} />
      {marquee?.enabled && <MarqueeBar section={marquee} />}
      <ContactSection section={contact} event={config.event} interactive={animated} />
      <SiteFooter footer={config.footer} social={config.social} />
    </main>
  );
}
