import {
  EVENT_CONFIG,
  EVENT_STATS,
  FAQ_ITEMS,
  FOOTER_CREDITS,
  FOOTER_LINKS,
  MARQUEE_ITEMS,
  NAV_ITEMS,
  SOCIAL_LINKS,
  SPONSOR_GROUPS,
} from "@/data/fecapCases";
import { FECAP_CASES_KEYWORDS } from "@/data/seo";
import { DEFAULT_PAGES } from "@/lib/landing/pages-defaults";
import type { CmsButton, LandingConfig, SectionStyles, SectionType } from "@/lib/landing/schema";

// Configuração padrão = conteúdo que já estava hardcoded na landing.
// É o fallback quando o banco está indisponível e a base do seed inicial.

const NO_STYLES: SectionStyles = { backgroundColor: "", textColor: "", accentColor: "", spacing: "default" };

function button(partial: Partial<CmsButton> & Pick<CmsButton, "label" | "url">): CmsButton {
  return { enabled: true, newTab: false, style: "filled", color: "", textColor: "", borderColor: "", ...partial };
}

const NETWORK_BY_LABEL = { IG: "instagram", TT: "tiktok", YT: "youtube", IN: "linkedin" } as const;
const CATEGORY_COLORS = { coral: "#ff4b23", blue: "#392bfa", cyan: "#72c7ff" } as const;

const marqueeItems = MARQUEE_ITEMS.map((item, index) => ({ id: `m${index + 1}`, text: item }));

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  schemaVersion: 1,
  event: {
    name: "FECAP Cases 2026 — Direções",
    slug: "fecap-cases-2026",
    startDate: "2026-10-19",
    endDate: "2026-10-23",
    time: "17h45 às 22h40",
    timezone: "America/Sao_Paulo",
    location: EVENT_CONFIG.locationLabel,
    address: EVENT_CONFIG.addressLabel,
    website: "",
    email: EVENT_CONFIG.email,
    phone: EVENT_CONFIG.phoneLabel,
  },
  design: {
    colors: {
      primary: "#ff4b23",
      secondary: "#073775",
      accent: "#c8ff00",
      highlight: "#392bfa",
      background: "#faf9f6",
      text: "#062f68",
      textMuted: "#5b6b85",
      cta: "#c8ff00",
      border: "#d9d9d9",
    },
    bodyFont: "system",
    headingFont: "system",
    headingWeight: "900",
    bodyWeight: "400",
    buttonShape: "square",
    cardRadius: "medium",
    containerWidth: "default",
    sectionSpacing: "default",
  },
  seo: {
    title: "FECAP Cases 2026",
    description: "Landing page do FECAP Cases — conteúdo, experiências, conexões e cases que transformam.",
    keywords: FECAP_CASES_KEYWORDS.join(", "),
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterImage: "",
    index: true,
    follow: true,
  },
  social: SOCIAL_LINKS.map((item, index) => ({
    id: `s${index + 1}`,
    network: NETWORK_BY_LABEL[item.shortLabel as keyof typeof NETWORK_BY_LABEL] ?? "instagram",
    url: item.href,
    active: true,
    showInHeader: item.shortLabel !== "TT",
  })),
  header: {
    logoUrl: "/logos/logo_direcoes.svg",
    logoAlt: "FECAP Cases",
    logoWidth: 100,
    background: "gradient",
    backgroundColor: "#bc4202",
    backgroundColorEnd: "#6e090b",
    scrolledColor: "",
    textColor: "",
    fixed: true,
    hideOnScroll: false,
    showSocial: true,
    links: NAV_ITEMS.map((item, index) => ({
      id: `n${index + 1}`,
      label: item.label,
      url: item.href,
      newTab: false,
      active: true,
    })),
    cta: button({ enabled: false, label: "Garantir ingresso", url: "/ingressos" }),
  },
  footer: {
    logoUrl: "/logos/logo_direcoes.svg",
    logoColor: "",
    tagline: "Caminhos que Transformam",
    linksTitle: "LINKS RÁPIDOS",
    socialTitle: "REDES SOCIAIS",
    links: FOOTER_LINKS.map((item, index) => ({
      id: `f${index + 1}`,
      label: item.label,
      url: item.href,
      newTab: false,
      active: true,
    })),
    credits: FOOTER_CREDITS.map((line, index) => ({ id: `c${index + 1}`, text: line })),
    giantWord: "DIREÇÕES",
    backgroundColor: "",
    textColor: "",
    showSocial: true,
  },
  sections: [
    {
      id: "hero",
      type: "hero",
      enabled: true,
      styles: NO_STYLES,
      content: {
        eyebrow: "CAMINHOS QUE TRANSFORMAM",
        logoUrl: "/fecap-cases-logo.png",
        logoAlt: "direções — FECAP Cases 2026",
        title: "",
        description: "",
        locationLabel: "",
        dateLabel: "",
        backgroundImage: "/fecap-cases-hero.png",
        overlayColor: "#580000",
        overlayOpacity: 15,
        eyebrowColor: "",
        primaryButton: button({ label: "Ver programação", url: "/programacao" }),
        secondaryButton: button({ label: "Garantir ingresso na Sympla ↗", url: "/ingressos", style: "outline" }),
      },
    },
    {
      id: "marquee-top",
      type: "marquee",
      enabled: true,
      styles: NO_STYLES,
      content: { items: marqueeItems, speed: 26, direction: "left", animated: true },
    },
    {
      id: "countdown",
      type: "countdown",
      enabled: true,
      styles: NO_STYLES,
      content: {
        title: "CONTAGEM\nREGRESSIVA",
        targetDate: "2026-10-19",
        targetTime: "08:00",
        labels: { days: "dias", hours: "horas", minutes: "min", seconds: "seg" },
        cardColor: "",
        numberColor: "",
        labelColor: "",
        separatorColor: "",
        whenFinished: "started",
        finishedMessage: "O evento começou!",
      },
    },
    {
      id: "about",
      type: "about",
      enabled: true,
      styles: NO_STYLES,
      content: {
        eyebrow: "SOBRE O EVENTO",
        title: "MAIS POR QUE",
        titleHighlight: "DIREÇÕES?",
        description:
          "O FECAP Cases 2026 — Direções é um evento acadêmico que conecta conhecimento, criatividade e um propósito cada vez mais amplo, para transformações e tecnologias já estão causando mudanças.",
        imageUrl: "",
        cardColor: "",
        stats: EVENT_STATS.map((stat, index) => ({
          id: `st${index + 1}`,
          value: stat.value,
          label: stat.label,
          description: "",
        })),
      },
    },
    {
      id: "schedule",
      type: "schedule",
      enabled: false,
      styles: NO_STYLES,
      content: {
        eyebrow: "PROGRAMAÇÃO",
        title: "CINCO NOITES,",
        titleHighlight: "UMA DIREÇÃO",
        description: "Workshops simultâneos, ativações culturais e duas palestras no Teatro a cada noite.",
        button: button({ label: "Ver programação completa", url: "/programacao" }),
      },
    },
    {
      id: "partners",
      type: "partners",
      enabled: true,
      styles: NO_STYLES,
      content: {
        ribbonImage: "/logos/faixa.png",
        ribbonAlt: "Patrocinadores, apoiadores e parceiros",
        categories: SPONSOR_GROUPS.map((group, index) => ({
          id: `cat${index + 1}`,
          name: group.title,
          color: CATEGORY_COLORS[group.tone],
          active: true,
          placeholders: group.count,
        })),
        partners: [],
      },
    },
    {
      id: "faq",
      type: "faq",
      enabled: true,
      styles: NO_STYLES,
      content: {
        eyebrow: "FAQ",
        title: "VOCÊ\nPERGUNTA E",
        titleHighlight: "A GENTE\nRESPONDE",
        description: "Reunimos as principais dúvidas para você chegar ao evento sabendo como funciona cada etapa.",
        items: FAQ_ITEMS.map((item, index) => ({
          id: `q${index + 1}`,
          question: item.question,
          answer: item.answer,
          active: true,
        })),
      },
    },
    {
      id: "marquee-bottom",
      type: "marquee",
      enabled: true,
      styles: NO_STYLES,
      content: { items: marqueeItems, speed: 26, direction: "right", animated: true },
    },
    {
      id: "contact",
      type: "contact",
      enabled: true,
      styles: NO_STYLES,
      content: {
        title: "CONTATO",
        description: "Quer participar, apoiar ou saber mais? Fale com a organização do FECAP Cases.",
        showEmail: true,
        showPhone: true,
        showAddress: true,
        addressLabel: EVENT_CONFIG.cityLabel,
        whatsapp: "",
        mapsUrl: EVENT_CONFIG.mapsUrl,
        form: {
          nameLabel: "Nome",
          emailLabel: "E-mail",
          messageLabel: "Mensagem",
          namePlaceholder: "",
          emailPlaceholder: "",
          messagePlaceholder: "",
          buttonLabel: "Enviar mensagem",
          successMessage: "Mensagem enviada! A organização responde pelo e-mail informado.",
          errorMessage: "Não foi possível enviar sua mensagem. Tente novamente em instantes.",
        },
      },
    },
  ],
  pages: DEFAULT_PAGES,
};

export function defaultSection<T extends SectionType>(type: T) {
  const found = DEFAULT_LANDING_CONFIG.sections.find((section) => section.type === type);
  if (!found) throw new Error(`Seção padrão ausente: ${type}`);
  return structuredClone(found) as Extract<LandingConfig["sections"][number], { type: T }>;
}
