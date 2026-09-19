"use client";

import { useState } from "react";
import { type CategoryWithUsage, deleteCategory, saveCategory } from "@/app/admin/blog/actions";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { Modal } from "@/components/admin/ui/Modal";
import type { CategoryInput } from "@/lib/blog/schema";
import { slugify } from "@/lib/blog/slug";

type Draft = CategoryInput & { id: string | null; slugTouched: boolean };

const NEW_CATEGORY: Draft = { id: null, name: "", slug: "", description: "", color: "#ff4b23", isActive: true, slugTouched: false };

export function CategoryManager({ initial, canEdit, canDelete }: { initial: CategoryWithUsage[]; canEdit: boolean; canDelete: boolean }) {
  const { toast, confirm } = useFeedback();
  const [categories, setCategories] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = (list: CategoryWithUsage[]) => [...list].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  async function handleSave() {
    if (!draft || saving) return;
    setSaving(true);
    const { id } = draft;
    const result = await saveCategory(id, { name: draft.name, slug: slugify(draft.slug, 80), description: draft.description, color: draft.color, isActive: draft.isActive });
    setSaving(false);
    if (!result.ok) return toast(result.error, "error");

    setCategories((current) => {
      const previous = current.find((item) => item.id === result.data.id);
      return sorted([...current.filter((item) => item.id !== result.data.id), { ...result.data, postCount: previous?.postCount ?? 0 }]);
    });
    setDraft(null);
    toast(id ? "Categoria atualizada." : "Categoria criada.");
  }

  async function handleToggle(category: CategoryWithUsage) {
    setBusyId(category.id);
    const { id, postCount, ...input } = category;
    const result = await saveCategory(id, { ...input, isActive: !category.isActive });
    setBusyId(null);
    if (!result.ok) return toast(result.error, "error");
    setCategories((current) => current.map((item) => (item.id === id ? { ...result.data, postCount } : item)));
    toast(result.data.isActive ? "Categoria ativada." : "Categoria desativada.");
  }

  async function handleDelete(category: CategoryWithUsage) {
    const confirmed = await confirm({
      title: "Excluir categoria?",
      description:
        category.postCount > 0
          ? `"${category.name}" está em ${category.postCount} publicação(ões). Elas não serão apagadas, mas ficarão sem categoria.`
          : `"${category.name}" será excluída.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    setBusyId(category.id);
    const result = await deleteCategory(category.id);
    setBusyId(null);
    if (!result.ok) return toast(result.error, "error");
    setCategories((current) => current.filter((item) => item.id !== category.id));
    toast("Categoria excluída.");
  }

  return (
    <>
      <header className="adm-topbar">
        <div className="adm-topbar-title">
          <h1>Categorias</h1>
          <p>Organizam as publicações e viram filtros em /blog.</p>
        </div>
        {canEdit && (
          <div className="adm-topbar-actions">
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setDraft(NEW_CATEGORY)}>
              + Nova categoria
            </button>
          </div>
        )}
      </header>

      <div className="adm-page">
        <section className="adm-card">
          {categories.length === 0 ? (
            <div className="adm-empty-state">
              <strong>Nenhuma categoria criada.</strong>
              <p>Crie categorias como Tecnologia, Carreira ou Eventos para organizar o blog.</p>
              {canEdit && (
                <button type="button" className="adm-btn adm-btn-primary" onClick={() => setDraft(NEW_CATEGORY)}>
                  Criar primeira categoria
                </button>
              )}
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th scope="col">Nome</th>
                    <th scope="col">Descrição</th>
                    <th scope="col">Publicações</th>
                    <th scope="col">Situação</th>
                    <th scope="col">
                      <span className="adm-sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} data-busy={busyId === category.id}>
                      <th scope="row" data-label="Nome">
                        <span className="adm-blog-category">
                          <i style={{ background: category.color }} aria-hidden="true" />
                          {category.name}
                        </span>
                        <small>/blog?categoria={category.slug}</small>
                      </th>
                      <td data-label="Descrição">{category.description || "—"}</td>
                      <td data-label="Publicações">{category.postCount}</td>
                      <td data-label="Situação">
                        <span className={`adm-badge ${category.isActive ? "adm-badge-live" : "adm-badge-warning"}`}>{category.isActive ? "Ativa" : "Inativa"}</span>
                      </td>
                      <td className="adm-table-actions">
                        {canEdit && (
                          <>
                            <button type="button" className="adm-btn adm-btn-small" onClick={() => setDraft({ ...category, slugTouched: true })}>
                              Editar
                            </button>
                            <button type="button" className="adm-btn adm-btn-small" onClick={() => handleToggle(category)}>
                              {category.isActive ? "Desativar" : "Ativar"}
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => handleDelete(category)}>
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
        </section>
      </div>

      {draft && (
        <Modal title={draft.id ? "Editar categoria" : "Nova categoria"} onClose={() => setDraft(null)}>
          <form
            className="adm-dialog-form"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
          >
            <TextField
              label="Nome"
              value={draft.name}
              maxLength={60}
              onChange={(name) => setDraft({ ...draft, name, slug: draft.slugTouched ? draft.slug : slugify(name, 80) })}
            />
            <TextField label="Slug" value={draft.slug} maxLength={80} onChange={(slug) => setDraft({ ...draft, slug: slug.toLowerCase(), slugTouched: true })} hint="Usado no endereço do filtro. Apenas letras, números e hífens." />
            <TextAreaField label="Descrição" rows={2} value={draft.description} maxLength={300} onChange={(description) => setDraft({ ...draft, description })} />
            <ColorPicker label="Cor" value={draft.color} defaultValue="#ff4b23" onChange={(color) => setDraft({ ...draft, color })} />
            <Toggle label="Categoria ativa" hint="Inativas não aparecem no site." checked={draft.isActive} onChange={(isActive) => setDraft({ ...draft, isActive })} />
            <div className="adm-dialog-actions">
              <button type="button" className="adm-btn" onClick={() => setDraft(null)}>
                Cancelar
              </button>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || draft.name.trim().length < 2 || draft.slug === ""}>
                {saving ? "Salvando…" : "Salvar categoria"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
