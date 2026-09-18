import type { CSSProperties } from "react";
import {
  type CmsButton,
  type DesignConfig,
  type EventConfig,
  type LandingConfig,
  type SectionOf,
  type SectionStyles,
  type SectionType,
  TIMEZONES,
} from "@/lib/landing/schema";

const MONTHS = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
];

/** "2026-10-19" + "2026-10-23" → "19 A 23 DE OUTUBRO DE 2026". */
export function formatEventDates(event: Pick<EventConfig, "startDate" | "endDate">): string {
  const [sy, sm, sd] = event.startDate.split("-").map(Number);
  const [ey, em, ed] = event.endDate.split("-").map(Number);
  if (!sy || !ey) return "";

  if (event.startDate === event.endDate) return `${sd} DE ${MONTHS[sm - 1]} DE ${sy}`;
  if (sy === ey && sm === em) return `${sd} A ${ed} DE ${MONTHS[sm - 1]} DE ${sy}`;
  if (sy === ey) return `${sd} DE ${MONTHS[sm - 1]} A ${ed} DE ${MONTHS[em - 1]} DE ${sy}`;
  return `${sd} DE ${MONTHS[sm - 1]} DE ${sy} A ${ed} DE ${MONTHS[em - 1]} DE ${ey}`;
}

export function countdownTargetIso(date: string, time: string, timezone: EventConfig["timezone"]): string {
  return `${date}T${time}:00${TIMEZONES[timezone]}`;
}

export function phoneHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

const FONT_STACKS: Record<DesignConfig["bodyFont"], string> = {
  system: "Arial,Helvetica,sans-serif",
  archivo: "var(--font-wide),Arial,sans-serif",
  inter: "var(--font-inter),Arial,sans-serif",
  poppins: "var(--font-poppins),Arial,sans-serif",
  "space-grotesk": "var(--font-space-grotesk),Arial,sans-serif",
};

export const FONT_LABELS: Record<DesignConfig["bodyFont"], string> = {
  system: "Arial (padrão do site)",
  archivo: "Archivo",
  inter: "Inter",
  poppins: "Poppins",
  "space-grotesk": "Space Grotesk",
};

const BUTTON_RADIUS = { square: "5px", rounded: "14px", pill: "999px" } as const;
const CARD_RADIUS = { none: "0px", small: "10px", medium: "31px", large: "44px" } as const;
const CONTAINER = { narrow: "1040px", default: "1180px", wide: "1360px" } as const;
const SPACING = { compact: "0.72", default: "1", spacious: "1.3" } as const;

/** Tokens globais → variáveis CSS aplicadas no <main>. Apenas valores pré-validados. */
export function designVariables(design: DesignConfig): CSSProperties {
  const { colors } = design;

  return {
    "--orange": colors.primary,
    "--navy": colors.secondary,
    "--lime": colors.accent,
    "--blue": colors.highlight,
    "--paper": colors.background,
    "--ink": colors.text,
    "--muted": colors.textMuted,
    "--cta": colors.cta,
    "--border": colors.border,
    "--font-body": FONT_STACKS[design.bodyFont],
    "--font-heading": FONT_STACKS[design.headingFont],
    "--heading-weight": design.headingWeight,
    "--body-weight": design.bodyWeight,
    "--button-radius": BUTTON_RADIUS[design.buttonShape],
    "--card-radius": CARD_RADIUS[design.cardRadius],
    "--container": CONTAINER[design.containerWidth],
    "--space-scale": SPACING[design.sectionSpacing],
  } as CSSProperties;
}

const SECTION_SPACING = { default: undefined, compact: "0.7", spacious: "1.35" } as const;

/** Estilos por seção → variáveis consumidas pelo cms.css (com fallback para o tema). */
export function sectionVariables(styles: SectionStyles, extra: Record<string, string | undefined> = {}): CSSProperties {
  const vars: Record<string, string> = {};

  if (styles.backgroundColor) vars["--sec-bg"] = styles.backgroundColor;
  if (styles.textColor) vars["--sec-text"] = styles.textColor;
  if (styles.accentColor) vars["--sec-accent"] = styles.accentColor;

  const spacing = SECTION_SPACING[styles.spacing];
  if (spacing) vars["--sec-space"] = spacing;

  for (const [key, value] of Object.entries(extra)) {
    if (value) vars[key] = value;
  }

  return vars as CSSProperties;
}

export function buttonVariables(button: CmsButton): CSSProperties {
  const vars: Record<string, string> = {};
  if (button.color) vars["--btn-bg"] = button.color;
  if (button.textColor) vars["--btn-text"] = button.textColor;
  if (button.borderColor) vars["--btn-border"] = button.borderColor;
  return vars as CSSProperties;
}

export function multiline(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function findSection<T extends SectionType>(config: LandingConfig, type: T): SectionOf<T> | undefined {
  return config.sections.find((section): section is SectionOf<T> => section.type === type);
}
