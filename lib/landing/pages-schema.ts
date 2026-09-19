import { z } from "zod";
import { id, imageUrl, linkUrl, text } from "@/lib/landing/primitives";

// ---------- Blocos reutilizados pelas páginas internas ----------
const pageSeo = z.object({ title: text(70), description: text(200) });

/** Topo laranja de cada página: texto de apoio, título e parágrafo de abertura. */
const pageHero = z.object({ eyebrow: text(80), title: text(80), lead: text(320) });

/** Cabeçalho de um bloco: "Enter" no título quebra a linha; o destaque sai colorido. */
const heading = z.object({
  eyebrow: text(60),
  title: text(80),
  titleHighlight: text(80),
  /** false = o destaque continua na mesma linha do título. */
  highlightOnNewLine: z.boolean(),
  text: text(400),
});

const pageButton = z.object({ enabled: z.boolean(), label: text(60), url: linkUrl, newTab: z.boolean() });

const card = z.object({ id, tag: text(24), title: text(80), text: text(400) });
const line = z.object({ id, text: text(300) });

export const TIER_TONES = ["orange", "blue", "cyan"] as const;
export const GALLERY_SHAPES = ["square", "wide", "tall"] as const;
export const GALLERY_TONES = ["orange", "blue", "navy", "lime", "red"] as const;

// ---------- Programação ----------
const blockBase = { id, time: text(30), title: text(80) };

export const scheduleBlockSchema = z.discriminatedUnion("type", [
  z.object({
    ...blockBase,
    type: z.literal("workshops"),
    tag: text(40),
    sessions: z.array(z.object({ id, label: text(40), room: text(40), title: text(160), speaker: text(200) })).max(8),
  }),
  z.object({ ...blockBase, type: z.literal("activation"), tag: text(40), description: text(400) }),
  z.object({
    ...blockBase,
    type: z.literal("talk"),
    tag: text(40),
    speaker: z.object({ name: text(100), role: text(160), bio: text(400), photoUrl: imageUrl }),
    moderator: z.object({ name: text(100), role: text(160) }),
  }),
  z.object({ ...blockBase, type: z.literal("break") }),
]);

const scheduleDay = z.object({ id, label: text(40), blocks: z.array(scheduleBlockSchema).max(16) });

// ---------- Páginas ----------
const sobrePage = z.object({
  seo: pageSeo,
  hero: pageHero,
  primaryButton: pageButton,
  secondaryButton: pageButton,
  introHeading: heading,
  intro: z.array(line.extend({ text: text(700) })).max(6),
  stats: z.array(z.object({ id, value: text(8), label: text(40) })).max(6),
  pillarsHeading: heading,
  pillars: z.array(card).max(12),
  flowHeading: heading,
  flow: z.array(z.object({ id, time: text(20), title: text(80), text: text(300) })).max(12),
  teamHeading: heading,
  team: z.array(card).max(9),
});

const programacaoPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  days: z.array(scheduleDay).min(1).max(10),
});

const patrocinadoresPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  button: pageButton,
  benefitsHeading: heading,
  benefits: z.array(card).max(8),
  tiersHeading: heading,
  tiers: z
    .array(
      z.object({
        id,
        name: text(40),
        tone: z.enum(TIER_TONES),
        summary: text(200),
        perks: z.array(line).max(10),
        button: pageButton,
      }),
    )
    .max(6),
});

const galeriaPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  heading,
  allLabel: text(30),
  categories: z.array(z.object({ id, name: text(30) })).max(10),
  items: z
    .array(
      z.object({
        id,
        categoryId: id,
        imageUrl,
        alt: text(160),
        caption: text(160),
        shape: z.enum(GALLERY_SHAPES),
        tone: z.enum(GALLERY_TONES),
        active: z.boolean(),
      }),
    )
    .max(120),
});

const ingressosPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  /** Link da Sympla usado em todos os botões de inscrição. */
  ticketsUrl: linkUrl,
  heroButtonLabel: text(60),
  stepsHeading: heading,
  steps: z.array(card).max(6),
  nightsHeading: heading,
  /** Vazio = horário das configurações do evento. */
  nightTime: text(40),
  nightBadge: text(30),
  nightButtonLabel: text(40),
  nightLinkLabel: text(60),
  notesHeading: heading,
  notes: z.array(line).max(12),
  showHelpNote: z.boolean(),
});

const duvidasPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  heading,
  helpTitle: text(80),
  helpText: text(200),
  helpButton: pageButton,
  searchLabel: text(40),
  searchPlaceholder: text(80),
});

const contatoPage = z.object({
  seo: pageSeo,
  hero: pageHero,
  heading,
  emailLabel: text(30),
  phoneLabel: text(30),
  addressLabel: text(30),
  socialTitle: text(60),
});

const blogPage = z.object({ seo: pageSeo, hero: pageHero });

/** Faixa de chamada exibida no fim das páginas internas. */
const ctaBand = z.object({
  highlight: text(60),
  primaryButton: pageButton,
  secondaryButton: pageButton,
});

export const pagesSchema = z.object({
  sobre: sobrePage,
  programacao: programacaoPage,
  patrocinadores: patrocinadoresPage,
  galeria: galeriaPage,
  ingressos: ingressosPage,
  duvidas: duvidasPage,
  contato: contatoPage,
  blog: blogPage,
  cta: ctaBand,
});

export type PagesConfig = z.infer<typeof pagesSchema>;
export type PageKey = Exclude<keyof PagesConfig, "cta">;
export type PageHero = z.infer<typeof pageHero>;
export type PageHeading = z.infer<typeof heading>;
export type PageButton = z.infer<typeof pageButton>;
export type PageSeo = z.infer<typeof pageSeo>;
export type PageCard = z.infer<typeof card>;
export type PageLine = z.infer<typeof line>;
export type ScheduleBlock = z.infer<typeof scheduleBlockSchema>;
export type ScheduleDay = z.infer<typeof scheduleDay>;
export type GalleryItem = PagesConfig["galeria"]["items"][number];
export type GalleryCategory = PagesConfig["galeria"]["categories"][number];

export const PAGE_LABELS: Record<PageKey, string> = {
  sobre: "Sobre",
  programacao: "Programação",
  patrocinadores: "Patrocinadores",
  galeria: "Galeria",
  ingressos: "Ingressos",
  duvidas: "Dúvidas",
  contato: "Contato",
  blog: "Blog",
};

export const PAGE_PATHS: Record<PageKey, string> = {
  sobre: "/sobre",
  programacao: "/programacao",
  patrocinadores: "/patrocinadores",
  galeria: "/galeria",
  ingressos: "/ingressos",
  duvidas: "/duvidas",
  contato: "/contato",
  blog: "/blog",
};
