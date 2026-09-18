import { z } from "zod";
import { isSafeImageUrl, isSafeUrl } from "@/lib/landing/urls";

// ---------- Primitivos validados ----------
const text = (max: number) => z.string().max(max);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida");
/** "" = usar a cor padrão do tema. */
const optionalColor = z.union([hexColor, z.literal("")]);
const linkUrl = z.string().max(500).refine(isSafeUrl, "Link inválido ou inseguro");
const imageUrl = z.string().max(700).refine(isSafeImageUrl, "Imagem inválida");
const id = z.string().min(1).max(60);

export const FONT_OPTIONS = ["system", "archivo", "inter", "poppins", "space-grotesk"] as const;
export const SOCIAL_NETWORKS = ["instagram", "tiktok", "youtube", "linkedin", "whatsapp", "facebook", "x"] as const;
export const TIMEZONES = {
  "America/Sao_Paulo": "-03:00",
  "America/Manaus": "-04:00",
  "America/Rio_Branco": "-05:00",
  "America/Noronha": "-02:00",
  UTC: "+00:00",
} as const;

export const buttonSchema = z.object({
  enabled: z.boolean(),
  label: text(60),
  url: linkUrl,
  newTab: z.boolean(),
  style: z.enum(["filled", "outline", "ghost"]),
  color: optionalColor,
  textColor: optionalColor,
  borderColor: optionalColor,
});

export const linkSchema = z.object({
  id,
  label: text(40),
  url: linkUrl,
  newTab: z.boolean(),
  active: z.boolean(),
});

const sectionStyles = z.object({
  backgroundColor: optionalColor,
  textColor: optionalColor,
  accentColor: optionalColor,
  spacing: z.enum(["default", "compact", "spacious"]),
});

// ---------- Conteúdo de cada tipo de seção ----------
const heroContent = z.object({
  eyebrow: text(80),
  logoUrl: imageUrl,
  logoAlt: text(120),
  title: text(80),
  description: text(300),
  locationLabel: text(80),
  /** Vazio = gerado a partir das datas do evento. */
  dateLabel: text(80),
  backgroundImage: imageUrl,
  overlayColor: hexColor,
  overlayOpacity: z.number().int().min(0).max(90),
  eyebrowColor: optionalColor,
  primaryButton: buttonSchema,
  secondaryButton: buttonSchema,
});

const marqueeContent = z.object({
  items: z.array(z.object({ id, text: text(40) })).max(16),
  speed: z.number().int().min(10).max(80),
  direction: z.enum(["left", "right"]),
  animated: z.boolean(),
});

const countdownContent = z.object({
  title: text(60),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  targetTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  labels: z.object({ days: text(12), hours: text(12), minutes: text(12), seconds: text(12) }),
  cardColor: optionalColor,
  numberColor: optionalColor,
  labelColor: optionalColor,
  separatorColor: optionalColor,
  whenFinished: z.enum(["hide", "started", "custom"]),
  finishedMessage: text(120),
});

const aboutContent = z.object({
  eyebrow: text(60),
  title: text(80),
  titleHighlight: text(80),
  description: text(900),
  imageUrl,
  cardColor: optionalColor,
  stats: z.array(z.object({ id, value: text(8), label: text(40), description: text(120) })).max(6),
});

const scheduleContent = z.object({
  eyebrow: text(60),
  title: text(80),
  titleHighlight: text(80),
  description: text(400),
  button: buttonSchema,
});

const partnersContent = z.object({
  ribbonImage: imageUrl,
  ribbonAlt: text(120),
  categories: z
    .array(
      z.object({
        id,
        name: text(40),
        color: hexColor,
        active: z.boolean(),
        /** Espaços "LOGO" exibidos enquanto a categoria não tem logos cadastrados. */
        placeholders: z.number().int().min(0).max(12),
      }),
    )
    .max(8),
  partners: z
    .array(
      z.object({
        id,
        categoryId: id,
        name: text(80),
        logoUrl: imageUrl,
        website: linkUrl,
        description: text(200),
        active: z.boolean(),
      }),
    )
    .max(80),
});

const faqContent = z.object({
  eyebrow: text(40),
  title: text(80),
  titleHighlight: text(80),
  description: text(300),
  items: z.array(z.object({ id, question: text(200), answer: text(1200), active: z.boolean() })).max(40),
});

const contactContent = z.object({
  title: text(40),
  description: text(300),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  showAddress: z.boolean(),
  /** Vazio = endereço completo das configurações do evento. */
  addressLabel: text(200),
  whatsapp: linkUrl,
  mapsUrl: linkUrl,
  form: z.object({
    nameLabel: text(30),
    emailLabel: text(30),
    messageLabel: text(30),
    namePlaceholder: text(60),
    emailPlaceholder: text(60),
    messagePlaceholder: text(80),
    buttonLabel: text(40),
    successMessage: text(200),
    errorMessage: text(200),
  }),
});

const base = { id, enabled: z.boolean(), styles: sectionStyles };

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("hero"), content: heroContent }),
  z.object({ ...base, type: z.literal("marquee"), content: marqueeContent }),
  z.object({ ...base, type: z.literal("countdown"), content: countdownContent }),
  z.object({ ...base, type: z.literal("about"), content: aboutContent }),
  z.object({ ...base, type: z.literal("schedule"), content: scheduleContent }),
  z.object({ ...base, type: z.literal("partners"), content: partnersContent }),
  z.object({ ...base, type: z.literal("faq"), content: faqContent }),
  z.object({ ...base, type: z.literal("contact"), content: contactContent }),
]);

const headerSchema = z.object({
  logoUrl: imageUrl,
  logoAlt: text(120),
  logoWidth: z.number().int().min(60).max(220),
  background: z.enum(["gradient", "solid", "transparent"]),
  backgroundColor: hexColor,
  backgroundColorEnd: hexColor,
  scrolledColor: optionalColor,
  textColor: optionalColor,
  fixed: z.boolean(),
  hideOnScroll: z.boolean(),
  showSocial: z.boolean(),
  links: z.array(linkSchema).max(10),
  cta: buttonSchema,
});

const footerSchema = z.object({
  logoUrl: imageUrl,
  logoColor: optionalColor,
  tagline: text(120),
  linksTitle: text(40),
  socialTitle: text(40),
  links: z.array(linkSchema).max(12),
  credits: z.array(z.object({ id, text: text(200) })).max(4),
  giantWord: text(16),
  backgroundColor: optionalColor,
  textColor: optionalColor,
  showSocial: z.boolean(),
});

const timezoneKeys = Object.keys(TIMEZONES) as [keyof typeof TIMEZONES, ...(keyof typeof TIMEZONES)[]];

const eventSchema = z.object({
  name: text(80),
  slug: z.string().regex(/^[a-z0-9-]{1,60}$/, "Use letras minúsculas, números e hífen"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: text(40),
  timezone: z.enum(timezoneKeys),
  location: text(80),
  address: text(200),
  website: linkUrl,
  email: z.union([z.string().email().max(120), z.literal("")]),
  phone: text(40),
});

const designSchema = z.object({
  colors: z.object({
    primary: hexColor,
    secondary: hexColor,
    accent: hexColor,
    highlight: hexColor,
    background: hexColor,
    text: hexColor,
    textMuted: hexColor,
    cta: hexColor,
    border: hexColor,
  }),
  bodyFont: z.enum(FONT_OPTIONS),
  headingFont: z.enum(FONT_OPTIONS),
  headingWeight: z.enum(["700", "800", "900"]),
  bodyWeight: z.enum(["400", "500"]),
  buttonShape: z.enum(["square", "rounded", "pill"]),
  cardRadius: z.enum(["none", "small", "medium", "large"]),
  containerWidth: z.enum(["narrow", "default", "wide"]),
  sectionSpacing: z.enum(["compact", "default", "spacious"]),
});

const seoSchema = z.object({
  title: text(70),
  description: text(200),
  keywords: text(300),
  canonicalUrl: z.union([z.string().url().max(300).startsWith("https://"), z.literal("")]),
  ogTitle: text(90),
  ogDescription: text(200),
  ogImage: imageUrl,
  twitterImage: imageUrl,
  index: z.boolean(),
  follow: z.boolean(),
});

const socialSchema = z
  .array(
    z.object({
      id,
      network: z.enum(SOCIAL_NETWORKS),
      url: linkUrl,
      active: z.boolean(),
      showInHeader: z.boolean(),
    }),
  )
  .max(10);

export const landingConfigSchema = z.object({
  schemaVersion: z.literal(1),
  event: eventSchema,
  design: designSchema,
  seo: seoSchema,
  social: socialSchema,
  header: headerSchema,
  footer: footerSchema,
  sections: z.array(sectionSchema).min(1).max(24),
});

export type LandingConfig = z.infer<typeof landingConfigSchema>;
export type LandingSection = z.infer<typeof sectionSchema>;
export type SectionType = LandingSection["type"];
export type SectionOf<T extends SectionType> = Extract<LandingSection, { type: T }>;
export type SectionStyles = z.infer<typeof sectionStyles>;
export type CmsButton = z.infer<typeof buttonSchema>;
export type CmsLink = z.infer<typeof linkSchema>;
export type SocialLink = z.infer<typeof socialSchema>[number];
export type HeaderConfig = z.infer<typeof headerSchema>;
export type FooterConfig = z.infer<typeof footerSchema>;
export type DesignConfig = z.infer<typeof designSchema>;
export type EventConfig = z.infer<typeof eventSchema>;
export type SeoConfig = z.infer<typeof seoSchema>;

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  marquee: "Faixa / Marquee",
  countdown: "Contagem regressiva",
  about: "Sobre o evento",
  schedule: "Programação",
  partners: "Patrocinadores, apoiadores e parceiros",
  faq: "FAQ",
  contact: "Contato",
};

/** Tipos que podem existir mais de uma vez na página. */
export const DUPLICABLE_SECTIONS: SectionType[] = ["marquee"];
