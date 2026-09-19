export type NavItem = {
  label: string;
  href: string;
};

export type SponsorGroup = {
  title: string;
  count: number;
  tone: "coral" | "blue" | "cyan";
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Patrocinadores", href: "/patrocinadores" },
  { label: "Programação", href: "/programacao" },
  { label: "Blog", href: "/blog" },
  { label: "Dúvidas", href: "/duvidas" },
  { label: "Contatos", href: "/contato" },
];

export const SOCIAL_LINKS = [
  { label: "Instagram", shortLabel: "IG", href: "https://www.instagram.com/fecapcases/" },
  { label: "TikTok", shortLabel: "TT", href: "https://www.tiktok.com/@fecap_cases" },
  { label: "YouTube", shortLabel: "YT", href: "/#contato" },
];

export const FOOTER_LINKS: NavItem[] = [
  { label: "Programação", href: "/programacao" },
  { label: "Ingressos", href: "/ingressos" },
  { label: "Galeria", href: "/galeria" },
];

export const FOOTER_CREDITS = [
  "Evento realizado pelos alunos de 6º semestre de Comunicação Social, PP e RP — FECAP 2026",
  "Desenvolvido por NúcleoTech",
];

export const MARQUEE_ITEMS = [
  "WORKSHOPS",
  "ATIVAÇÕES",
  "CULTURA",
  "CRIATIVIDADE",
  "MERCADO",
  "CONEXÕES",
];

export const SPONSOR_GROUPS: SponsorGroup[] = [
  { title: "patrocinadores", count: 3, tone: "coral" },
  { title: "apoiadores", count: 6, tone: "blue" },
  { title: "parceiros", count: 10, tone: "cyan" },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "O evento é gratuito?",
    answer:
      "Sim. A participação no FECAP Cases é gratuita, mediante inscrição e disponibilidade de vagas em cada atividade.",
  },
  {
    question: "Preciso me inscrever para cada atividade?",
    answer:
      "A inscrição principal garante acesso ao evento. Algumas experiências com capacidade limitada podem exigir reserva específica.",
  },
  {
    question: "Onde o evento acontece?",
    answer:
      "O evento acontece no campus FECAP, em São Paulo. Endereço, salas e mapas podem ser destacados na programação de cada atividade.",
  },
  {
    question: "Qual é o horário do evento?",
    answer:
      "A programação pode variar por dia. Use a seção de programação para consultar o início, término e local de cada atração.",
  },
  {
    question: "Os workshops têm inscrição separada?",
    answer:
      "Quando houver limite de vagas, o workshop exibirá um botão próprio de reserva. Isso evita filas e organiza a capacidade das salas.",
  },
  {
    question: "O certificado de participação será emitido?",
    answer:
      "Sim. O certificado pode ser disponibilizado aos participantes elegíveis após o evento, conforme critérios de presença definidos pela organização.",
  },
  {
    question: "Como acompanho as novidades do evento?",
    answer:
      "Acompanhe os canais oficiais da FECAP e os comunicados enviados para o e-mail cadastrado na inscrição.",
  },
  {
    question: "Tenho outra dúvida. Como entro em contato?",
    answer:
      "Use o formulário desta página ou fale com a organização pelos canais oficiais divulgados no rodapé.",
  },
];

export const EVENT_STATS = [
  { value: "5", label: "dias de conteúdo" },
  { value: "15+", label: "palestrantes convidados" },
  { value: "8+", label: "workshops e experiências" },
];

export const EVENT_CONFIG = {
  dateLabel: "19 A 23 DE OUTUBRO DE 2026",
  locationLabel: "FECAP · SÃO PAULO",
  countdownTarget: "2026-10-19T08:00:00-03:00",
  email: "fecapcases@fecap.edu.br",
  phoneLabel: "+55 11 3272-3500",
  phoneHref: "+551132723500",
  cityLabel: "São Paulo · SP",
  addressLabel: "Av. da Liberdade, 532 — Liberdade, São Paulo · SP, 01502-001",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=FECAP+Av.+da+Liberdade+532+S%C3%A3o+Paulo",
  // TODO: trocar pelo link real do evento na Sympla.
  ticketsUrl: "https://www.sympla.com.br/",
} as const;
