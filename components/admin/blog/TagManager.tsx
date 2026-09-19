"use client";

import { useState } from "react";
import { type TagWithUsage, deleteTag, saveTag } from "@/app/admin/blog/actions";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { TextField } from "@/components/admin/ui/Fields";
import { Modal } from "@/components/admin/ui/Modal";
import { slugify } from "@/lib/blog/slug";

type Draft = { id: string | null; name: string; slug: string; slugTouched: boolean };

const NEW_TAG: Draft = { id: null, name: "", slug: "", slugTouched: false };

export function TagManager({ initial, canEdit, canDelete }: { initial: TagWithUsage[]; canEdit: boolean; canDelete: boolean }) {
  const { toast, confirm } = useFeedback();
  const [tags, setTags] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const visible = tags.filter((tag) => tag.name.toLowerCase().includes(filter.trim().toLowerCase()));

  async function handleSave() {
    if (!draft || saving) return;
    setSaving(true);
    const result = await saveTag(draft.id, { name: draft.name, slug: slugify(draft.slug, 60) });
    setSaving(false);
    if (!result.ok) return toast(result.error, "error");

    setTags((current) => {
      const previous = current.find((item) => item.id === result.data.id);
      return [...current.filter((item) => item.id !== result.data.id), { ...result.data, postCount: previous?.postCount ?? 0 }].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    });
    setDraft(null);
    toast(draft.id ? "Tag atualizada." : "Tag criada.");
  }

  async function handleDelete(tag: TagWithUsage) {
    const confirmed = await confirm({
      title: "Excluir tag?",
      description: tag.postCount > 0 ? `"${tag.name}" será removida de ${tag.postCount} publicação(ões).` : `"${tag.name}" será excluída.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    const result = await deleteTag(tag.id);
    if (!result.ok) return toast(result.error, "error");
    setTags((current) => current.filter((item) => item.id !== tag.id));
    toast("Tag excluída.");
  }

  return (
    <>
      <header className="adm-topbar">
        <div className="adm-topbar-title">
          <h1>Tags</h1>
          <p>Assuntos das publicações. Também podem ser criadas direto no editor.</p>
        </div>
        {canEdit && (
          <div className="adm-topbar-actions">
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setDraft(NEW_TAG)}>
              + Nova tag
            </button>
          </div>
        )}
      </header>

      <div className="adm-page">
        <section className="adm-card">
          {tags.length === 0 ? (
            <div className="adm-empty-state">
              <strong>Nenhuma tag criada.</strong>
              <p>Tags ajudam a relacionar publicações sobre o mesmo assunto.</p>
              {canEdit && (
                <button type="button" className="adm-btn adm-btn-primary" onClick={() => setDraft(NEW_TAG)}>
                  Criar primeira tag
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="adm-filters">
                <input className="adm-input adm-filters-search" type="search" aria-label="Buscar tag" placeholder="Buscar tag..." value={filter} onChange={(event) => setFilter(event.target.value)} />
              </div>
              {visible.length === 0 ? (
                <p className="adm-empty">Nenhuma tag encontrada.</p>
              ) : (
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th scope="col">Tag</th>
                        <th scope="col">Slug</th>
                        <th scope="col">Publicações</th>
                        <th scope="col">
                          <span className="adm-sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((tag) => (
                        <tr key={tag.id}>
                          <th scope="row" data-label="Tag">
                            #{tag.name}
                          </th>
                          <td data-label="Slug">{tag.slug}</td>
                          <td data-label="Publicações">{tag.postCount}</td>
                          <td className="adm-table-actions">
                            {canEdit && (
                              <button type="button" className="adm-btn adm-btn-small" onClick={() => setDraft({ id: tag.id, name: tag.name, slug: tag.slug, slugTouched: true })}>
                                Editar
                              </button>
                            )}
                            {canDelete && (
                              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => handleDelete(tag)}>
                                Excluir
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {draft && (
        <Modal title={draft.id ? "Editar tag" : "Nova tag"} onClose={() => setDraft(null)}>
          <form
            className="adm-dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <TextField label="Nome" value={draft.name} maxLength={40} onChange={(name) => setDraft({ ...draft, name, slug: draft.slugTouched ? draft.slug : slugify(name, 60) })} />
            <TextField label="Slug" value={draft.slug} maxLength={60} onChange={(slug) => setDraft({ ...draft, slug: slug.toLowerCase(), slugTouched: true })} />
            <div className="adm-dialog-actions">
              <button type="button" className="adm-btn" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || draft.name.trim().length < 2 || draft.slug === ""}>
                {saving ? "Salvando…" : "Salvar tag"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
