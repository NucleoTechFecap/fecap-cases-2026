import type { Metadata } from "next";
import { PageShell } from "@/components/pages/PageShell";
import { SectionHead } from "@/components/pages/SectionHead";

export const metadata: Metadata = {
  title: "Página não encontrada | FECAP Cases 2026",
  description: "O endereço que você tentou acessar não existe no site do FECAP Cases 2026.",
};

const SHORTCUTS = [
  { href: "/programacao", icon: "↗", title: "Programação", text: "As cinco noites de workshops, ativações e palestras." },
  { href: "/ingressos", icon: "★", title: "Ingressos", text: "Como se inscrever e garantir a sua vaga." },
  { href: "/blog", icon: "✎", title: "Blog", text: "Artigos e bastidores do evento." },
  { href: "/duvidas", icon: "?", title: "Dúvidas", text: "Respostas para as perguntas mais comuns." },
  { href: "/sobre", icon: "◆", title: "Sobre", text: "O que é o FECAP Cases e quem faz acontecer." },
  { href: "/contato", icon: "✉", title: "Contato", text: "Fale com a organização." },
];

/** O "0" do 404 é o "õ" em perspectiva da marca Direções (o mesmo do ícone do site). */
function Code404() {
  return (
    <p className="nf-code" aria-hidden="true">
      <span>4</span>
      <svg viewBox="66 22 54 38" focusable="false">
        <path d="M85.7288 35.5667L78.4971 31.2466L76.0018 32.7372L83.2335 37.0573L85.7288 35.5667Z" />
        <path d="M118.181 26.8728L89.0613 44.3443L89.2596 59L67.3185 45.5751L67.318 29.3473L88.0807 41.7523L118.181 23.5759V26.8728ZM70.5575 43.7834L85.9678 53.2123L85.8458 44.1904L70.5573 35.0559L70.5575 43.7834Z" />
        <path d="M70.5575 43.7834L70.5573 35.0559L77.9147 39.4517L70.5575 43.7834Z" opacity=".55" />
      </svg>
      <span>4</span>
    </p>
  );
}

export default function NotFound() {
  return (
    <PageShell
      eyebrow="ERRO 404 · CAMINHO NÃO ENCONTRADO"
      title="Essa direção não existe"
      lead="O endereço pode ter mudado, sido removido ou digitado errado. Escolha um dos caminhos abaixo e siga em frente."
      heroTop={<Code404 />}
      heroActions={
        <>
          <a className="button button-lime" href="/">
            Voltar para o início
          </a>
          <a className="button button-outline" href="/programacao">
            Ver programação
          </a>
        </>
      }
      showCta={false}
    >
      <section className="page-section">
        <div className="shell">
          <SectionHead
            eyebrow="OUTROS CAMINHOS"
            title={
              <>
                TALVEZ VOCÊ <span>PROCURE</span>
              </>
            }
          />

          <div className="card-grid card-grid-3" data-reveal-group>
            {SHORTCUTS.map((item) => (
              <a className="channel-card" href={item.href} key={item.href}>
                <span className="channel-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
