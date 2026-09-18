"use client";

import { logItemAction } from "@/app/admin/actions";
import { newId, patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { LinkField } from "@/components/admin/landing/LinkField";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, RangeField, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import { defaultSection } from "@/lib/landing/defaults";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"partners">["content"];
type Category = Content["categories"][number];
type Partner = Content["partners"][number];

/** Patrocinadores, apoiadores e parceiros: categorias dinâmicas + logos por categoria. */
export function PartnersEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const { confirm, toast } = useFeedback();
  const set = patcher(value, onChange);

  const updateCategory = (id: string, patch: Partial<Category>) =>
    set("categories", value.categories.map((category) => (category.id === id ? { ...category, ...patch } : category)));
  const updatePartner = (id: string, patch: Partial<Partner>) =>
    set("partners", value.partners.map((partner) => (partner.id === id ? { ...partner, ...patch } : partner)));

  function addPartner(category: Category) {
    const partner: Partner = { id: newId("p"), categoryId: category.id, name: "Nova marca", logoUrl: "", website: "", description: "", active: true };
    set("partners", [...value.partners, partner]);
    void logItemAction("sponsor_created", category.name);
    toast(`Marca adicionada em "${category.name}".`);
  }

  async function removePartner(partner: Partner) {
    const confirmed = await confirm({
      title: "Excluir marca?",
      description: `"${partner.name}" será removida desta categoria.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    set("partners", value.partners.filter((item) => item.id !== partner.id));
    void logItemAction("sponsor_deleted", partner.name);
  }

  async function removeCategory(category: Category) {
    const count = value.partners.filter((partner) => partner.categoryId === category.id).length;
    const confirmed = await confirm({
      title: "Excluir categoria?",
      description: count > 0 ? `"${category.name}" e as ${count} marcas cadastradas nela serão removidas.` : `"${category.name}" será removida.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    onChange({
      ...value,
      categories: value.categories.filter((item) => item.id !== category.id),
      partners: value.partners.filter((partner) => partner.categoryId !== category.id),
    });
  }

  /** Reordena só as marcas de uma categoria, preservando a posição das demais. */
  function reorderPartners(categoryId: string, ordered: Partner[]) {
    const others = value.partners.filter((partner) => partner.categoryId !== categoryId);
    set("partners", [...others, ...ordered]);
  }

  return (
    <>
      <Group title="Faixa ilustrada">
        <ImageUploader label="Imagem da faixa" folder="sponsors" value={value.ribbonImage} defaultValue={defaultSection("partners").content.ribbonImage} onChange={(next) => set("ribbonImage", next)} />
        <TextField label="Descrição da imagem (acessibilidade)" value={value.ribbonAlt} maxLength={120} onChange={(next) => set("ribbonAlt", next)} />
      </Group>

      <Group title="Categorias e marcas" description="Arraste as categorias e as marcas para definir a ordem no site.">
        <SortableList
          label="Categorias"
          items={value.categories}
          onReorder={(next) => set("categories", next)}
          renderItem={(category) => {
            const partners = value.partners.filter((partner) => partner.categoryId === category.id);

            return (
              <details className="adm-item">
                <summary>
                  <span className="adm-dot" style={{ background: category.color }} />
                  <span data-muted={!category.active}>{category.name || "Nova categoria"}</span>
                  <em>{partners.length} marca(s)</em>
                </summary>

                <TextField label="Título da categoria" value={category.name} maxLength={40} onChange={(next) => updateCategory(category.id, { name: next })} />
                <ColorPicker label="Cor" value={category.color} onChange={(next) => updateCategory(category.id, { color: next })} />
                <Toggle label="Categoria visível no site" checked={category.active} onChange={(next) => updateCategory(category.id, { active: next })} />
                <RangeField label="Espaços reservados" min={0} max={12} value={category.placeholders} onChange={(next) => updateCategory(category.id, { placeholders: next })} hint='Quadros "LOGO" exibidos enquanto não houver marcas cadastradas.' />

                <SortableList
                  label={`Marcas de ${category.name}`}
                  items={partners}
                  onReorder={(next) => reorderPartners(category.id, next)}
                  renderItem={(partner) => (
                    <details className="adm-item adm-item-nested">
                      <summary>
                        <span data-muted={!partner.active}>{partner.name || "Nova marca"}</span>
                      </summary>
                      <TextField label="Nome" value={partner.name} maxLength={80} onChange={(next) => updatePartner(partner.id, { name: next })} />
                      <ImageUploader label="Logo" folder={category.id === value.categories[0]?.id ? "sponsors" : "partners"} value={partner.logoUrl} onChange={(next) => updatePartner(partner.id, { logoUrl: next })} />
                      <LinkField label="Site" value={partner.website} onChange={(next) => updatePartner(partner.id, { website: next })} hint="Ao clicar no logo, o site abre em nova aba." />
                      <TextAreaField label="Descrição (opcional)" rows={2} value={partner.description} maxLength={200} onChange={(next) => updatePartner(partner.id, { description: next })} />
                      <Toggle label="Visível no site" checked={partner.active} onChange={(next) => updatePartner(partner.id, { active: next })} />
                      <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => removePartner(partner)}>
                        Excluir marca
                      </button>
                    </details>
                  )}
                />

                <div className="adm-inline">
                  <button type="button" className="adm-btn adm-btn-add" disabled={value.partners.length >= 80} onClick={() => addPartner(category)}>
                    + Adicionar em {category.name || "categoria"}
                  </button>
                  <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => removeCategory(category)}>
                    Excluir categoria
                  </button>
                </div>
              </details>
            );
          }}
        />

        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.categories.length >= 8}
          onClick={() => set("categories", [...value.categories, { id: newId("cat"), name: "nova categoria", color: "#ff4b23", active: true, placeholders: 0 }])}
        >
          + Nova categoria
        </button>
      </Group>
    </>
  );
}
