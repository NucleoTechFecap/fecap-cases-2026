export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Atalho para editar uma chave de um objeto imutável: set("title", "Novo"). */
export function patcher<T extends object>(value: T, onChange: (next: T) => void) {
  return <K extends keyof T>(key: K, next: T[K]) => onChange({ ...value, [key]: next });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const AUDIT_LABELS: Record<string, string> = {
  landing_initialized: "Landing inicializada com o conteúdo do site",
  landing_updated: "Rascunho salvo",
  landing_published: "Landing publicada",
  landing_restored: "Versão restaurada",
  landing_draft_discarded: "Rascunho descartado",
  asset_uploaded: "Imagem enviada",
  asset_deleted: "Imagem excluída",
  sponsor_created: "Marca adicionada",
  sponsor_deleted: "Marca excluída",
  faq_created: "Pergunta adicionada",
  faq_deleted: "Pergunta excluída",
  section_reset: "Seção restaurada ao padrão",
  landing_reset: "Landing restaurada ao padrão",
  blog_post_created: "Publicação criada",
  blog_post_updated: "Publicação atualizada",
  blog_post_published: "Publicação publicada",
  blog_post_unpublished: "Publicação voltou para rascunho",
  blog_post_archived: "Publicação arquivada",
  blog_post_deleted: "Publicação excluída",
  blog_category_created: "Categoria criada",
  blog_category_updated: "Categoria atualizada",
  blog_category_deleted: "Categoria excluída",
  blog_tag_created: "Tag criada",
  blog_tag_updated: "Tag atualizada",
  blog_tag_deleted: "Tag excluída",
};

/** Texto legível de uma entrada da auditoria (aba Histórico e Início do painel). */
export function describeAudit(entry: { action: string; metadata: Record<string, unknown> }): string {
  const label = AUDIT_LABELS[entry.action] ?? entry.action;
  const { version, label: detail, slug } = entry.metadata;
  if (typeof version === "number") return `${label} (versão ${version})`;
  if (typeof detail === "string" && detail) return `${label}: ${detail}`;
  if (typeof slug === "string" && slug) return `${label}: ${slug}`;
  return label;
}
