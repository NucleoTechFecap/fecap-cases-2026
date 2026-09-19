"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type AdminPostRow, type PostListFilters, type PostListResult, type PostSort, changePostStatus, deletePost, duplicatePost, listPosts } from "@/app/admin/blog/actions";
import { BlogTable, type RowAction } from "@/components/admin/blog/BlogTable";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { type BlogCategory, POST_STATUSES, type PostStatus, STATUS_LABELS } from "@/lib/blog/types";

type BlogDashboardProps = { initial: PostListResult; categories: BlogCategory[]; canEdit: boolean; canPublish: boolean };

const SORTS: { value: PostSort; label: string }[] = [
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigas" },
  { value: "updated", label: "Última atualização" },
  { value: "title-asc", label: "Título A-Z" },
  { value: "title-desc", label: "Título Z-A" },
];

const NO_FILTERS: PostListFilters = { search: "", status: "", categoryId: "", author: "", from: "", to: "", sort: "newest", page: 1 };

export function BlogDashboard({ initial, categories, canEdit, canPublish }: BlogDashboardProps) {
  const { toast, confirm } = useFeedback();
  const [data, setData] = useState(initial);
  const [filters, setFilters] = useState<PostListFilters>(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const requestId = useRef(0);
  const isFirstRun = useRef(true);

  const load = useCallback(async (next: PostListFilters) => {
    const current = ++requestId.current;
    setLoading(true);
    const result = await listPosts(next);
    if (current !== requestId.current) return; // chegou uma resposta antiga
    setLoading(false);

    if (result.ok) {
      setData(result.data);
      setError(null);
    } else setError(result.error);
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    void load(filters);
  }, [filters, load]);

  // Busca com debounce: não dispara uma consulta por tecla.
  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => (current.search === search ? current : { ...current, search, page: 1 })), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const patch = (next: Partial<PostListFilters>) => setFilters((current) => ({ ...current, page: 1, ...next }));
  const isFiltered = Boolean(filters.search || filters.status || filters.categoryId || filters.author || filters.from || filters.to);

  async function handleAction(row: AdminPostRow, action: RowAction) {
    if (action === "delete") {
      const confirmed = await confirm({
        title: "Excluir publicação?",
        description: `Tem certeza que deseja excluir "${row.title}"? Ela sairá do site e do painel.`,
        confirmLabel: "Excluir",
        destructive: true,
      });
      if (!confirmed) return;
    }
    if (action === "unpublish" || action === "archive") {
      const confirmed = await confirm({
        title: action === "archive" ? "Arquivar publicação?" : "Despublicar?",
        description: `"${row.title}" sairá do site${action === "archive" ? " e ficará arquivada no painel." : " e voltará a ser rascunho."}`,
        confirmLabel: action === "archive" ? "Arquivar" : "Despublicar",
        destructive: true,
      });
      if (!confirmed) return;
    }
    if (action === "publish") {
      const confirmed = await confirm({ title: "Publicar agora?", description: `"${row.title}" ficará visível para todos em /blog.`, confirmLabel: "Publicar" });
      if (!confirmed) return;
    }

    setBusyId(row.id);
    const result =
      action === "duplicate"
        ? await duplicatePost(row.id)
        : action === "delete"
          ? await deletePost(row.id)
          : await changePostStatus(row.id, action === "publish" ? "published" : action === "archive" ? "archived" : "draft");
    setBusyId(null);

    if (!result.ok) return toast(result.error, "error");

    if (action === "duplicate" && "id" in result.data) {
      toast("Publicação duplicada como rascunho.");
      window.location.assign(`/admin/blog/${result.data.id}/edit`);
      return;
    }

    toast({ publish: "Publicação publicada.", unpublish: "Publicação voltou para rascunho.", archive: "Publicação arquivada.", delete: "Publicação excluída.", duplicate: "" }[action]);
    void load(filters);
  }

  const metrics: { label: string; value: number; status: PostStatus | "" }[] = [
    { label: "Total de publicações", value: data.metrics.total, status: "" },
    { label: "Publicadas", value: data.metrics.published, status: "published" },
    { label: "Rascunhos", value: data.metrics.draft, status: "draft" },
    { label: "Agendadas", value: data.metrics.scheduled, status: "scheduled" },
    { label: "Arquivadas", value: data.metrics.archived, status: "archived" },
  ];

  return (
    <>
      <header className="adm-topbar">
        <div className="adm-topbar-title">
          <h1>Blog</h1>
          <p>Publicações do site em /blog.</p>
        </div>
        <div className="adm-topbar-actions">
          <a className="adm-btn" href="/blog" target="_blank" rel="noopener noreferrer">
            Ver blog ↗
          </a>
          {canEdit && (
            <a className="adm-btn adm-btn-primary" href="/admin/blog/new">
              + Nova publicação
            </a>
          )}
        </div>
      </header>

      <div className="adm-page">
        <ul className="adm-metrics" aria-label="Resumo das publicações">
          {metrics.map((metric) => (
            <li key={metric.label}>
              <button type="button" aria-pressed={(filters.status ?? "") === metric.status} onClick={() => patch({ status: metric.status })}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <section className="adm-card">
          <div className="adm-filters" role="search" aria-label="Filtrar publicações">
            <input className="adm-input adm-filters-search" type="search" aria-label="Buscar publicação" placeholder="Buscar publicação..." value={search} maxLength={80} onChange={(event) => setSearch(event.target.value)} />

            <select className="adm-input" aria-label="Status" value={filters.status ?? ""} onChange={(event) => patch({ status: event.target.value as PostStatus | "" })}>
              <option value="">Todos os status</option>
              {POST_STATUSES.map((status) => (
                <option value={status} key={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <select className="adm-input" aria-label="Categoria" value={filters.categoryId ?? ""} onChange={(event) => patch({ categoryId: event.target.value })}>
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select className="adm-input" aria-label="Autor" value={filters.author ?? ""} onChange={(event) => patch({ author: event.target.value })}>
              <option value="">Todos os autores</option>
              {data.authors.map((author) => (
                <option value={author} key={author}>
                  {author}
                </option>
              ))}
            </select>

            <label className="adm-filters-date">
              <span>Criada de</span>
              <input className="adm-input" type="date" value={filters.from ?? ""} max={filters.to || undefined} onChange={(event) => patch({ from: event.target.value })} />
            </label>
            <label className="adm-filters-date">
              <span>até</span>
              <input className="adm-input" type="date" value={filters.to ?? ""} min={filters.from || undefined} onChange={(event) => patch({ to: event.target.value })} />
            </label>

            <select className="adm-input" aria-label="Ordenação" value={filters.sort ?? "newest"} onChange={(event) => patch({ sort: event.target.value as PostSort })}>
              {SORTS.map((sort) => (
                <option value={sort.value} key={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>

            {isFiltered && (
              <button
                type="button"
                className="adm-btn adm-btn-small"
                onClick={() => {
                  setSearch("");
                  setFilters({ ...NO_FILTERS, sort: filters.sort });
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>

          <div aria-busy={loading} data-loading={loading} className="adm-blog-results">
            {error ? (
              <div className="adm-empty-state" role="alert">
                <strong>Não foi possível carregar as publicações.</strong>
                <p>{error}</p>
                <button type="button" className="adm-btn" onClick={() => load(filters)}>
                  Tentar novamente
                </button>
              </div>
            ) : data.rows.length === 0 ? (
              <div className="adm-empty-state">
                <strong>Nenhuma publicação encontrada.</strong>
                <p>{isFiltered ? "Ajuste a busca ou limpe os filtros." : "O blog ainda não tem publicações."}</p>
                {!isFiltered && canEdit && (
                  <a className="adm-btn adm-btn-primary" href="/admin/blog/new">
                    Criar primeira publicação
                  </a>
                )}
              </div>
            ) : (
              <BlogTable rows={data.rows} busyId={busyId} canEdit={canEdit} canPublish={canPublish} onAction={handleAction} />
            )}
          </div>

          {data.pageCount > 1 && (
            <nav className="adm-pagination" aria-label="Paginação">
              <button type="button" className="adm-btn adm-btn-small" disabled={data.page <= 1 || loading} onClick={() => setFilters({ ...filters, page: data.page - 1 })}>
                ← Anterior
              </button>
              <span>
                Página {data.page} de {data.pageCount} · {data.total} publicações
              </span>
              <button type="button" className="adm-btn adm-btn-small" disabled={data.page >= data.pageCount || loading} onClick={() => setFilters({ ...filters, page: data.page + 1 })}>
                Próxima →
              </button>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
