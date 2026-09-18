import type { Metadata } from "next";
import { ContactSection } from "@/components/landing/ContactSection";
import { MarqueeBar } from "@/components/landing/MarqueeBar";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { ScheduleAnimations } from "@/components/schedule/ScheduleAnimations";
import { ScheduleSection } from "@/components/schedule/ScheduleSection";
import { SCHEDULE_DAYS } from "@/data/schedule";
import { designVariables, findSection } from "@/lib/landing/derive";
import { getPublishedLanding } from "@/lib/landing/queries";
import "./programacao.css";

export const metadata: Metadata = {
  title: "Programação | FECAP Cases 2026",
  description:
    "Programação completa do FECAP Cases 2026 — workshops, ativações culturais e palestras, dia a dia.",
};

export default async function SchedulePage() {
  const { config } = await getPublishedLanding();
  const marquee = findSection(config, "marquee");
  const contact = findSection(config, "contact");

  return (
    <main
      data-cms
      data-heading-font={
        config.design.headingFont === "system"
          ? undefined
          : config.design.headingFont
      }
      style={designVariables(config.design)}
    >
      <ScheduleAnimations />
      <SiteHeader
        header={config.header}
        social={config.social}
        activeHref="/programacao"
      />
      <ScheduleSection days={SCHEDULE_DAYS} />
      {marquee?.enabled && <MarqueeBar section={marquee} />}
      <ContactSection section={contact} event={config.event} />
      <SiteFooter footer={config.footer} social={config.social} />
    </main>
  );
}
