// Conteúdo das páginas internas. Itens entre [colchetes] são placeholders para a organização preencher.

export type InfoCard = { title: string; text: string; tag?: string };

export const ABOUT_INTRO = [
  "O FECAP Cases 2026 — Direções é um evento acadêmico que conecta conhecimento, criatividade e mercado. Durante cinco noites, o campus da FECAP vira ponto de encontro entre estudantes, profissionais e marcas.",
  "O tema deste ano fala de escolhas: os caminhos que a comunicação, a tecnologia e a cultura estão abrindo — e como cada pessoa pode encontrar a sua direção dentro deles.",
];

export const ABOUT_PILLARS: InfoCard[] = [
  { tag: "01", title: "Workshops", text: "Salas simultâneas com atividades práticas para aprender fazendo, lado a lado com quem atua no mercado." },
  { tag: "02", title: "Ativações", text: "Intervenções culturais e experiências de marca que ocupam o Teatro antes de cada palestra." },
  { tag: "03", title: "Cultura", text: "Artistas e convidados que ampliam o repertório e mostram outras formas de contar histórias." },
  { tag: "04", title: "Criatividade", text: "Cases reais apresentados por quem criou, com bastidores, erros e aprendizados." },
  { tag: "05", title: "Mercado", text: "Profissionais e empresas compartilhando tendências, carreiras e oportunidades." },
  { tag: "06", title: "Conexões", text: "Intervalos pensados para networking entre estudantes, palestrantes e parceiros." },
];

export const NIGHT_FLOW = [
  { time: "17h45", title: "Workshops", text: "Duas salas simultâneas abrem a noite com atividades práticas." },
  { time: "19h00", title: "Ativação", text: "Convidado cultural ou experiência de marca no Teatro." },
  { time: "19h30", title: "Palestra 1", text: "Primeiro case da noite, com mediação e perguntas do público." },
  { time: "20h40", title: "Intervalo", text: "Pausa para café, conversas e conexões." },
  { time: "21h00", title: "Ativação 2", text: "Segunda intervenção cultural da noite." },
  { time: "21h30", title: "Palestra 2", text: "Encerramento com o segundo case e bate-papo final." },
];

export const ABOUT_TEAM: InfoCard[] = [
  {
    title: "Feito por estudantes",
    text: "O evento é realizado pelos alunos do 6º semestre de Comunicação Social, Publicidade e Propaganda e Relações Públicas da FECAP.",
  },
  {
    title: "Tecnologia NúcleoTech",
    text: "A plataforma digital do evento é desenvolvida pelo NúcleoTech, conectando a comunicação à tecnologia dentro da própria FECAP.",
  },
  {
    title: "Aberto ao público",
    text: "A participação é gratuita, mediante inscrição e disponibilidade de vagas em cada atividade.",
  },
];

export const SPONSOR_BENEFITS: InfoCard[] = [
  { tag: "Visibilidade", title: "Sua marca em todos os pontos de contato", text: "Presença no site, nas redes sociais, na comunicação visual do campus e nos materiais do evento." },
  { tag: "Relacionamento", title: "Contato direto com novos talentos", text: "Aproxime-se de estudantes de comunicação, negócios e tecnologia que estão prestes a entrar no mercado." },
  { tag: "Conteúdo", title: "Espaço para contar o seu case", text: "Ativações, workshops e participações em palco para apresentar projetos e a cultura da empresa." },
  { tag: "Propósito", title: "Apoio à educação", text: "Associe sua marca a um projeto acadêmico construído pelos próprios alunos, do planejamento à execução." },
];

export const SPONSOR_TIERS = [
  {
    name: "Patrocinador",
    tone: "orange",
    summary: "Máxima exposição e presença em palco.",
    perks: ["Logo em destaque no site e na cenografia", "Ativação de marca no Teatro", "Menções nas redes sociais do evento", "[Defina aqui as contrapartidas da cota]"],
  },
  {
    name: "Apoiador",
    tone: "blue",
    summary: "Marca presente durante toda a semana.",
    perks: ["Logo no site e nos materiais digitais", "Distribuição de brindes ou materiais", "Agradecimento na abertura das noites", "[Defina aqui as contrapartidas da cota]"],
  },
  {
    name: "Parceiro",
    tone: "cyan",
    summary: "Permutas, serviços e apoio institucional.",
    perks: ["Logo na seção de parceiros", "Divulgação cruzada nas redes", "Convites para a equipe participar", "[Defina aqui as contrapartidas da cota]"],
  },
] as const;

export const TICKET_STEPS: InfoCard[] = [
  { tag: "1", title: "Escolha os dias", text: "Confira a programação completa e veja quais noites e workshops combinam com você." },
  { tag: "2", title: "Inscreva-se na Sympla", text: "A inscrição é gratuita. Cada noite tem um ingresso próprio, sujeito à lotação do Teatro." },
  { tag: "3", title: "Apresente o QR Code", text: "No dia, leve o ingresso no celular e um documento com foto para o credenciamento." },
];

export const TICKET_NOTES = [
  "Entrada gratuita, mediante inscrição e disponibilidade de vagas.",
  "Workshops com capacidade limitada podem exigir reserva específica.",
  "O credenciamento abre antes do início das atividades de cada noite.",
  "Certificados são disponibilizados aos participantes elegíveis após o evento.",
];

export const GALLERY_CATEGORIES = ["Todos", "Palestras", "Workshops", "Ativações", "Bastidores"] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryItem = {
  id: number;
  category: Exclude<GalleryCategory, "Todos">;
  caption: string;
  shape: "wide" | "tall" | "square";
  tone: "orange" | "blue" | "navy" | "lime" | "red";
};

// Placeholders: troque por fotos reais adicionando `src` e usando next/image no GalleryGrid.
export const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, category: "Palestras", caption: "[Legenda da foto — palestra]", shape: "wide", tone: "orange" },
  { id: 2, category: "Workshops", caption: "[Legenda da foto — workshop]", shape: "square", tone: "blue" },
  { id: 3, category: "Bastidores", caption: "[Legenda da foto — bastidores]", shape: "tall", tone: "navy" },
  { id: 4, category: "Ativações", caption: "[Legenda da foto — ativação]", shape: "square", tone: "lime" },
  { id: 5, category: "Palestras", caption: "[Legenda da foto — palestra]", shape: "square", tone: "red" },
  { id: 6, category: "Workshops", caption: "[Legenda da foto — workshop]", shape: "wide", tone: "navy" },
  { id: 7, category: "Ativações", caption: "[Legenda da foto — ativação]", shape: "tall", tone: "orange" },
  { id: 8, category: "Bastidores", caption: "[Legenda da foto — bastidores]", shape: "square", tone: "blue" },
  { id: 9, category: "Palestras", caption: "[Legenda da foto — palestra]", shape: "square", tone: "lime" },
  { id: 10, category: "Workshops", caption: "[Legenda da foto — workshop]", shape: "square", tone: "red" },
  { id: 11, category: "Bastidores", caption: "[Legenda da foto — bastidores]", shape: "wide", tone: "orange" },
  { id: 12, category: "Ativações", caption: "[Legenda da foto — ativação]", shape: "square", tone: "navy" },
];
