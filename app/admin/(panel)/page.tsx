import { getLandingStatus, listAuditLogs, listContactMessages } from "@/app/admin/actions";
import { listPosts } from "@/app/admin/blog/actions";
import { StatusBadge } from "@/components/admin/blog/StatusBadge";
import { describeAudit, formatDateTime } from "@/components/admin/landing/helpers";
import { requirePanelAccess } from "@/lib/landing/auth";
import { getPublishedLanding } from "@/lib/landing/queries";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function eventCountdown(startDate: string, endDate: string): string {
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })).getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "";
  if (today > end) return "O evento já aconteceu";
  if (today >= start) return "O evento está acontecendo";
  const days = Math.round((start - today) / DAY_MS);
  return days === 1 ? "Falta 1 dia para o evento" : `Faltam ${days} dias para o evento`;
}

// Início do painel: resumo do site, do Blog e do que chegou pelo formulário de contato.
export default async function AdminHomePage() {
  const session = await requirePanelAccess();
  const [landing, posts, messages, logs, published] = await Promise.all([
    getLandingStatus(),
    listPosts({ sort: "updated" }),
    listContactMessages(),
    listAuditLogs(),
    getPublishedLanding(),
  ]);

  const { event } = published.config;
  const metrics = posts.ok ? posts.data.metrics : null;
  const recentPosts = posts.ok ? posts.data.rows.slice(0, 5) : [];
  const recentMessages = messages.ok ? messages.data.slice(0, 4) : [];
  const recentLogs = logs.ok ? logs.data.slice(0, 6) : [];
  const firstName = session.name.split(/[\s@]/)[0];
  const countdown = eventCountdown(event.startDate, event.endDate);

  const stats = [
    { value: metrics?.published ?? "—", label: "Publicadas", href: "/admin/blog" },
    { value: metrics?.draft ?? "—", label: "Rascunhos", href: "/admin/blog" },
    { value: metrics?.scheduled ?? "—", label: "Agendadas", href: "/admin/blog" },
    { value: messages.ok ? messages.data.length : "—", label: "Mensagens", href: "#mensagens" },
  ];

  return (
    <div className="adm-page adm-home">
      <section className="adm-home-hero">
        <div>
          <p className="adm-eyebrow">Painel da organização</p>
          <h1>
            Olá, <span>{firstName}</span>
          </h1>
          <p>
            {event.name}
            {countdown && ` · ${countdown}`}
          </p>
        </div>
        <div className="adm-home-hero-actions">
          <a className="adm-cta adm-cta-lime" href="/admin/landing-page">
            {session.canEdit ? "Editar landing page" : "Ver landing page"}
          </a>
          {session.canEdit && (
            <a className="adm-cta adm-cta-outline" href="/admin/blog/new">
              + Nova publicação
            </a>
          )}
        </div>
      </section>

      <ul className="adm-home-stats">
        {stats.map((stat) => (
          <li key={stat.label}>
            <a href={stat.href}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="adm-home-grid">
        <section className="adm-home-landing">
          <p className="adm-eyebrow">Landing page</p>
          {!landing.ok ? (
            <h2>{landing.error}</h2>
          ) : !landing.data.initialized ? (
            <>
              <h2>
                Ainda <span>não inicializada</span>
              </h2>
              <p>Abra o editor para migrar o conteúdo atual do site para o painel.</p>
            </>
          ) : (
            <>
              <h2>
                {landing.data.hasUnpublishedChanges ? (
                  <>
                    Rascunho com <span>alterações</span>
                  </>
                ) : (
                  <>
                    Tudo <span>publicado</span>
                  </>
                )}
              </h2>
              <dl>
                <div>
                  <dt>Versão no ar</dt>
                  <dd>{landing.data.publishedVersion ?? "—"}</dd>
                </div>
                <div>
                  <dt>Última publicação</dt>
                  <dd>{formatDateTime(landing.data.publishedAt)}</dd>
                </div>
                <div>
                  <dt>Rascunho salvo</dt>
                  <dd>{formatDateTime(landing.data.draftUpdatedAt)}</dd>
                </div>
              </dl>
            </>
          )}
          <div className="adm-inline">
            <a className="adm-cta adm-cta-lime" href="/admin/landing-page">
              Abrir editor
            </a>
            <a className="adm-cta adm-cta-ghost" href="/" target="_blank" rel="noopener">
              Ver site ↗
            </a>
          </div>
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>Blog</h2>
            <a className="adm-linklike" href="/admin/blog">
              Ver todas →
            </a>
          </header>
          {!posts.ok ? (
            <p className="adm-empty">{posts.error}</p>
          ) : recentPosts.length === 0 ? (
            <p className="adm-empty">O blog ainda não tem publicações.</p>
          ) : (
            <ul className="adm-home-list">
              {recentPosts.map((post) => (
                <li key={post.id}>
                  <a href={`/admin/blog/${post.id}/edit`}>{post.title || "Sem título"}</a>
                  <StatusBadge status={post.status} />
                  <span>Atualizada em {formatDateTime(post.updatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card" id="mensagens">
          <header className="adm-card-head">
            <h2>Mensagens recebidas</h2>
          </header>
          {!messages.ok ? (
            <p className="adm-empty">{messages.error}</p>
          ) : recentMessages.length === 0 ? (
            <p className="adm-empty">Nenhuma mensagem recebida ainda.</p>
          ) : (
            <ul className="adm-log">
              {recentMessages.map((message) => (
                <li key={message.id}>
                  <strong>
                    {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
                  </strong>
                  <p>{message.message}</p>
                  <span>{formatDateTime(message.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card">
          <header className="adm-card-head">
            <h2>Atividade recente</h2>
          </header>
          {!logs.ok ? (
            <p className="adm-empty">{logs.error}</p>
          ) : recentLogs.length === 0 ? (
            <p className="adm-empty">Nenhuma ação registrada.</p>
          ) : (
            <ul className="adm-log">
              {recentLogs.map((entry) => (
                <li key={entry.id}>
                  <strong>{describeAudit(entry)}</strong>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
