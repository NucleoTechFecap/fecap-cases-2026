import { EVENT_CONFIG, EVENT_STATS } from "@/data/fecapCases";
import {
  ABOUT_INTRO,
  ABOUT_PILLARS,
  ABOUT_TEAM,
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  type InfoCard,
  NIGHT_FLOW,
  SPONSOR_BENEFITS,
  SPONSOR_TIERS,
  TICKET_NOTES,
  TICKET_STEPS,
} from "@/data/pages";
import { SCHEDULE_DAYS } from "@/data/schedule";
import type { PageButton, PageKey, PagesConfig, ScheduleBlock } from "@/lib/landing/pages-schema";

// Conteúdo padrão das páginas internas = o texto que já estava fixo no site.

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[^\w]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const button = (label: string, url: string, newTab = false): PageButton => ({ enabled: true, label, url, newTab });
const cards = (prefix: string, items: InfoCard[]) => items.map((item, index) => ({ id: `${prefix}${index + 1}`, tag: item.tag ?? "", title: item.title, text: item.text }));
const lines = (prefix: string, items: readonly string[]) => items.map((item, index) => ({ id: `${prefix}${index + 1}`, text: item }));

const galleryCategories = GALLERY_CATEGORIES.filter((name) => name !== "Todos").map((name) => ({ id: slug(name), name }));

export const DEFAULT_PAGES: PagesConfig = {
  sobre: {
    seo: {
      title: "Sobre | FECAP Cases 2026",
      description: "Conheça o FECAP Cases 2026 — Direções: o que é, como funciona cada noite e quem faz o evento.",
    },
    hero: {
      eyebrow: "SOBRE O EVENTO",
      title: "Mas por que Direções?",
      lead: "Cinco noites de conteúdo, cultura e conexões para quem quer entender para onde a comunicação está indo — e escolher o próprio caminho.",
    },
    primaryButton: button("Ver programação", "/programacao"),
    secondaryButton: button("Garantir ingresso ↗", "/ingressos"),
    introHeading: { eyebrow: "O EVENTO", title: "CAMINHOS QUE", titleHighlight: "TRANSFORMAM", highlightOnNewLine: true, text: "" },
    intro: lines("intro", ABOUT_INTRO),
    stats: EVENT_STATS.map((stat, index) => ({ id: `stat${index + 1}`, value: stat.value, label: stat.label })),
    pillarsHeading: {
      eyebrow: "PILARES",
      title: "O QUE VOCÊ",
      titleHighlight: "VAI ENCONTRAR",
      highlightOnNewLine: true,
      text: "Seis frentes que se cruzam durante toda a semana — dentro e fora do palco.",
    },
    pillars: cards("pillar", ABOUT_PILLARS),
    flowHeading: {
      eyebrow: "COMO FUNCIONA",
      title: "O ROTEIRO DE",
      titleHighlight: "CADA NOITE",
      highlightOnNewLine: true,
      text: "Todas as noites seguem a mesma estrutura. Os nomes e temas de cada dia estão na programação completa.",
    },
    flow: NIGHT_FLOW.map((step, index) => ({ id: `flow${index + 1}`, ...step })),
    teamHeading: { eyebrow: "QUEM FAZ", title: "DE ALUNOS", titleHighlight: "PARA O MERCADO", highlightOnNewLine: true, text: "" },
    team: cards("team", ABOUT_TEAM),
  },

  programacao: {
    seo: {
      title: "Programação | FECAP Cases 2026",
      description: "Programação completa do FECAP Cases 2026 — workshops, ativações culturais e palestras, dia a dia.",
    },
    hero: {
      eyebrow: "PROGRAMAÇÃO",
      title: "Programação Completa",
      lead: "Navegue entre os dias. Cada noite traz workshops simultâneos, ativações culturais e duas palestras no Teatro.",
    },
    days: SCHEDULE_DAYS.map((day) => ({
      id: day.id,
      label: day.label,
      blocks: day.blocks.map((block, index): ScheduleBlock => {
        const id = `${day.id}-b${index + 1}`;
        if (block.type === "workshops") return { ...block, id, sessions: block.sessions.map((session, position) => ({ id: `${id}-s${position + 1}`, ...session })) };
        if (block.type === "talk") return { ...block, id, speaker: { ...block.speaker, photoUrl: "" } };
        return { ...block, id };
      }),
    })),
  },

  patrocinadores: {
    seo: {
      title: "Patrocinadores | FECAP Cases 2026",
      description: "Marcas que apoiam o FECAP Cases 2026 e como se tornar patrocinador, apoiador ou parceiro do evento.",
    },
    hero: {
      eyebrow: "PATROCINADORES, APOIADORES & PARCEIROS",
      title: "Quem caminha com a gente",
      lead: "O FECAP Cases só acontece porque marcas e instituições acreditam na formação de novos talentos. Conheça quem apoia — e saiba como fazer parte.",
    },
    button: button("Quero apoiar o evento", "/contato"),
    benefitsHeading: {
      eyebrow: "POR QUE APOIAR",
      title: "SUA MARCA NA",
      titleHighlight: "DIREÇÃO CERTA",
      highlightOnNewLine: true,
      text: "Quatro motivos para colocar a sua empresa dentro do maior evento de comunicação da FECAP.",
    },
    benefits: cards("benefit", SPONSOR_BENEFITS),
    tiersHeading: {
      eyebrow: "COTAS",
      title: "TRÊS FORMAS DE",
      titleHighlight: "PARTICIPAR",
      highlightOnNewLine: false,
      text: "As contrapartidas são ajustadas com cada marca. Fale com a organização para receber o plano comercial.",
    },
    tiers: SPONSOR_TIERS.map((tier, index) => ({
      id: `tier${index + 1}`,
      name: tier.name,
      tone: tier.tone,
      summary: tier.summary,
      perks: lines(`tier${index + 1}-perk`, tier.perks),
      button: button("Falar com a organização", "/contato"),
    })),
  },

  galeria: {
    seo: { title: "Galeria | FECAP Cases 2026", description: "Fotos das palestras, workshops, ativações e bastidores do FECAP Cases." },
    hero: {
      eyebrow: "GALERIA",
      title: "Momentos que ficam",
      lead: "Palestras, workshops, ativações e bastidores: reviva o que aconteceu no palco e fora dele.",
    },
    heading: { eyebrow: "FOTOS", title: "O EVENTO EM", titleHighlight: "IMAGENS", highlightOnNewLine: false, text: "As fotos oficiais serão publicadas aqui durante e depois do evento." },
    allLabel: "Todos",
    categories: galleryCategories,
    items: GALLERY_ITEMS.map((item) => ({
      id: `foto${item.id}`,
      categoryId: slug(item.category),
      imageUrl: "",
      alt: "",
      caption: item.caption,
      shape: item.shape,
      tone: item.tone,
      active: true,
    })),
  },

  ingressos: {
    seo: { title: "Ingressos | FECAP Cases 2026", description: "Garanta gratuitamente o seu ingresso para as noites do FECAP Cases 2026 pela Sympla." },
    hero: {
      eyebrow: "INGRESSOS",
      title: "Garanta o seu lugar",
      lead: "A entrada é gratuita, mediante inscrição. Escolha as noites que quer acompanhar e retire o seu ingresso pela Sympla.",
    },
    ticketsUrl: EVENT_CONFIG.ticketsUrl,
    heroButtonLabel: "Inscrever-se na Sympla ↗",
    stepsHeading: { eyebrow: "PASSO A PASSO", title: "TRÊS PASSOS ATÉ O", titleHighlight: "TEATRO", highlightOnNewLine: false, text: "" },
    steps: cards("step", TICKET_STEPS),
    nightsHeading: {
      eyebrow: "ESCOLHA AS NOITES",
      title: "UM INGRESSO",
      titleHighlight: "PARA CADA DIA",
      highlightOnNewLine: true,
      text: "Cada noite tem workshops simultâneos, ativações culturais e duas palestras no Teatro.",
    },
    nightTime: "",
    nightBadge: "Gratuito",
    nightButtonLabel: "Retirar ingresso ↗",
    nightLinkLabel: "Ver programação do dia",
    notesHeading: { eyebrow: "BOM SABER", title: "ANTES DE", titleHighlight: "SE INSCREVER", highlightOnNewLine: true, text: "" },
    notes: lines("note", TICKET_NOTES),
    showHelpNote: true,
  },

  duvidas: {
    seo: { title: "Dúvidas | FECAP Cases 2026", description: "Perguntas frequentes sobre inscrição, horários, workshops e certificados do FECAP Cases 2026." },
    hero: {
      eyebrow: "FAQ",
      title: "Você pergunta e a gente responde",
      lead: "Reunimos as principais dúvidas para você chegar ao evento sabendo como funciona cada etapa.",
    },
    heading: { eyebrow: "PERGUNTAS FREQUENTES", title: "TUDO O QUE", titleHighlight: "VOCÊ PRECISA SABER", highlightOnNewLine: true, text: "" },
    helpTitle: "Não achou a resposta?",
    helpText: "A organização responde pelos canais oficiais do evento.",
    helpButton: button("Enviar uma mensagem", "/contato"),
    searchLabel: "Buscar nas dúvidas",
    searchPlaceholder: "Ex.: certificado, inscrição, horário…",
  },

  contato: {
    seo: { title: "Contato | FECAP Cases 2026", description: "Fale com a organização do FECAP Cases 2026: e-mail, telefone, endereço e formulário de contato." },
    hero: {
      eyebrow: "CONTATO",
      title: "Vamos conversar?",
      lead: "Compartilhe conosco sua experiência, ideias, sugestões ou comentários. Quer participar, apoiar ou saber mais? É por aqui.",
    },
    heading: { eyebrow: "CANAIS OFICIAIS", title: "FALE COM A", titleHighlight: "ORGANIZAÇÃO", highlightOnNewLine: false, text: "" },
    emailLabel: "E-mail",
    phoneLabel: "Telefone",
    addressLabel: "Como chegar",
    socialTitle: "Acompanhe nas redes",
  },

  blog: {
    seo: { title: "Blog | FECAP Cases", description: "Artigos, bastidores e conteúdos do FECAP Cases sobre comunicação, mercado, carreira e inovação." },
    hero: { eyebrow: "BLOG", title: "Blog FECAP Cases", lead: "Conteúdos, bastidores e ideias de quem faz o FECAP Cases acontecer." },
  },

  cta: {
    highlight: "ESCOLHA A SUA DIREÇÃO.",
    primaryButton: button("Garantir ingresso ↗", "/ingressos"),
    secondaryButton: button("Ver programação", "/programacao"),
  },
};

export function defaultPage<K extends PageKey | "cta">(key: K): PagesConfig[K] {
  return structuredClone(DEFAULT_PAGES[key]);
}
