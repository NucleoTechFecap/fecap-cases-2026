"use client";

import { AboutEditor } from "@/components/admin/landing/AboutEditor";
import { ContactEditor } from "@/components/admin/landing/ContactEditor";
import { CountdownEditor } from "@/components/admin/landing/CountdownEditor";
import { FaqEditor } from "@/components/admin/landing/FaqEditor";
import { HeroEditor } from "@/components/admin/landing/HeroEditor";
import { MarqueeEditor } from "@/components/admin/landing/MarqueeEditor";
import { PartnersEditor } from "@/components/admin/landing/PartnersEditor";
import { ScheduleEditor } from "@/components/admin/landing/ScheduleEditor";
import { SectionStyleEditor } from "@/components/admin/landing/SectionStyleEditor";
import type { LandingSection } from "@/lib/landing/schema";

type SectionEditorProps = { section: LandingSection; onChange: (next: LandingSection) => void };

/** Escolhe o editor certo para o tipo da seção e acrescenta o bloco de aparência. */
export function SectionEditor({ section, onChange }: SectionEditorProps) {
  const styles = <SectionStyleEditor value={section.styles} withSpacing={section.type !== "hero" && section.type !== "marquee"} onChange={(next) => onChange({ ...section, styles: next })} />;

  switch (section.type) {
    case "hero":
      return (
        <>
          <HeroEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "marquee":
      return (
        <>
          <MarqueeEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "countdown":
      return (
        <>
          <CountdownEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "about":
      return (
        <>
          <AboutEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "schedule":
      return (
        <>
          <ScheduleEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "partners":
      return (
        <>
          <PartnersEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "faq":
      return (
        <>
          <FaqEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
    case "contact":
      return (
        <>
          <ContactEditor value={section.content} onChange={(content) => onChange({ ...section, content })} />
          {styles}
        </>
      );
  }
}
