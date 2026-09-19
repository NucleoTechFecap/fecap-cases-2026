import { getLatestPosts } from "@/lib/blog/queries";
import { getSiteUrl } from "@/lib/blog/site";
import { getPublishedLanding } from "@/lib/landing/queries";

export const revalidate = 3600;

const PAGES = [
  { path: "/", title: "Início", text: "visão geral do evento, contagem regressiva, patrocinadores, dúvidas e contato." },
  { path: "/sobre", title: "Sobre", text: "o que é o FECAP Cases, como funciona cada noite e quem organiza." },
  { path: "/programacao", title: "Programação", text: "agenda das cinco noites: workshops, ativações e palestras." },
  { path: "/ingressos", title: "Ingressos", text: "como se inscrever e garantir a participação." },
  { path: "/patrocinadores", title: "Patrocinadores", text: "cotas, contrapartidas e marcas que apoiam o evento." },
  { path: "/galeria", title: "Galeria", text: "fotos e registros do evento." },
  { path: "/duvidas", title: "Dúvidas", text: "perguntas frequentes sobre inscrição, local e certificados." },
  { path: "/contato", title: "Contato", text: "formulário e canais de atendimento da organização." },
  { path: "/blog", title: "Blog", text: "artigos e bastidores sobre comunicação, mercado, carreira e inovação." },
];

const formatDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

// Padrão llmstxt.org: resumo em Markdown para assistentes de IA. O conteúdo acompanha o que está
// PUBLICADO no CMS (dados do evento, FAQ) e as últimas publicações do Blog.
export async function GET() {
  const [{ config }, siteUrl, posts] = await Promise.all([getPublishedLanding(), getSiteUrl(), getLatestPosts(12)]);
  const { event, seo } = config;
  const faq = config.sections.flatMap((section) => (section.type === "faq" && section.enabled ? section.content.items : [])).filter((item) => item.active);

  const lines = [
    `# ${event.name}`,
    "",
    `> ${seo.description || "Evento acadêmico da FECAP que conecta conhecimento, criatividade e mercado."}`,
    "",
    "## Informações do evento",
    "",
    `- Quando: ${formatDate(event.startDate)} a ${formatDate(event.endDate)}${event.time ? `, ${event.time}` : ""} (horário de Brasília)`,
    `- Onde: ${[event.location, event.address].filter(Boolean).join(" — ")}`,
    "- Entrada: gratuita, mediante inscrição e disponibilidade de vagas",
    "- Realização: estudantes de Comunicação da FECAP (Fundação Escola de Comércio Álvares Penteado), com tecnologia do NúcleoTech",
    event.email ? `- Contato: ${event.email}` : "",
    "",
    "## Páginas",
    "",
    ...PAGES.map((page) => `- [${page.title}](${siteUrl}${page.path}): ${page.text}`),
  ];

  if (posts.length) {
    lines.push("", "## Blog — publicações recentes", "", ...posts.map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug})${post.excerpt ? `: ${post.excerpt}` : ""}`));
  }

  if (faq.length) {
    lines.push("", "## Perguntas frequentes", "", ...faq.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]));
  }

  lines.push("", "## Observações", "", "- O painel em /admin é restrito à organização e não deve ser indexado.", `- Sitemap: ${siteUrl}/sitemap.xml`);

  const body = lines.filter((line, index, all) => !(line === "" && all[index - 1] === "")).join("\n").trim();
  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
