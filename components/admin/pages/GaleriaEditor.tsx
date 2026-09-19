"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { HeadingFields, HeroFields, PageSeoFields } from "@/components/admin/pages/PageFields";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, Row, SelectField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { GalleryCategory, GalleryItem, PagesConfig } from "@/lib/landing/pages-schema";

type Galeria = PagesConfig["galeria"];

const SHAPE_OPTIONS = [
  { value: "square", label: "Quadrada" },
  { value: "wide", label: "Larga (2 colunas)" },
  { value: "tall", label: "Alta (2 linhas)" },
] as const;

const TONE_OPTIONS = [
  { value: "orange", label: "Laranja" },
  { value: "blue", label: "Azul" },
  { value: "navy", label: "Azul-marinho" },
  { value: "lime", label: "Verde-limão" },
  { value: "red", label: "Vermelho" },
] as const;

/** Galeria: categorias (filtros do site) e fotos enviadas pela biblioteca de mídia. */
export function GaleriaEditor({ value, onChange }: { value: Galeria; onChange: (next: Galeria) => void }) {
  const { confirm } = useFeedback();
  const set = patcher(value, onChange);
  const updateItem = (id: string, patch: Partial<GalleryItem>) => set("items", value.items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const categoryOptions = value.categories.map((category) => ({ value: category.id, label: category.name || "Sem nome" }));

  async function removeCategory(category: GalleryCategory) {
    const count = value.items.filter((item) => item.categoryId === category.id).length;
    const confirmed = await confirm({
      title: "Excluir categoria?",
      description: count > 0 ? `"${category.name}" e as ${count} fotos cadastradas nela serão removidas.` : `"${category.name}" será removida.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    onChange({ ...value, categories: value.categories.filter((item) => item.id !== category.id), items: value.items.filter((item) => item.categoryId !== category.id) });
  }

  return (
    <>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Cabeçalho das fotos">
        <HeadingFields value={value.heading} onChange={(next) => set("heading", next)} />
      </Group>

      <Group title="Categorias" description="Viram os botões de filtro acima das fotos.">
        <TextField label='Nome do filtro "todas as fotos"' value={value.allLabel} maxLength={30} onChange={(next) => set("allLabel", next)} />
        <SortableList
          label="Categorias"
          items={value.categories}
          onReorder={(next) => set("categories", next)}
          renderItem={(category) => (
            <div className="adm-line-item">
              <TextField
                label="Nome"
                value={category.name}
                maxLength={30}
                onChange={(name) => set("categories", value.categories.map((item) => (item.id === category.id ? { ...item, name } : item)))}
              />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => removeCategory(category)}>
                Excluir
              </button>
            </div>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.categories.length >= 10}
          onClick={() => set("categories", [...value.categories, { id: newId("cat"), name: "Nova categoria" }])}
        >
          + Nova categoria
        </button>
      </Group>

      <Group title="Fotos" description="Sem imagem, o espaço aparece como um bloco colorido com a palavra FOTO. A ordem desta lista é a ordem no site.">
        <SortableList
          label="Fotos"
          items={value.items}
          onReorder={(next) => set("items", next)}
          renderItem={(item, index) => (
            <details className="adm-item">
              <summary>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span data-muted={!item.active}>{item.caption || "Foto sem legenda"}</span>
              </summary>
              <ImageUploader label="Imagem" folder="gallery" value={item.imageUrl} onChange={(imageUrl) => updateItem(item.id, { imageUrl })} />
              <TextField label="Legenda" value={item.caption} maxLength={160} onChange={(caption) => updateItem(item.id, { caption })} />
              <TextField label="Descrição para leitores de tela" value={item.alt} maxLength={160} onChange={(alt) => updateItem(item.id, { alt })} hint="Vazio = usa a legenda." />
              {categoryOptions.length > 0 && (
                <SelectField label="Categoria" value={item.categoryId} options={categoryOptions} onChange={(categoryId) => updateItem(item.id, { categoryId })} />
              )}
              <Row>
                <SelectField label="Formato" value={item.shape} options={SHAPE_OPTIONS} onChange={(shape) => updateItem(item.id, { shape })} />
                <SelectField label="Cor de fundo (sem imagem)" value={item.tone} options={TONE_OPTIONS} onChange={(tone) => updateItem(item.id, { tone })} />
              </Row>
              <Toggle label="Visível no site" checked={item.active} onChange={(active) => updateItem(item.id, { active })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("items", value.items.filter((entry) => entry.id !== item.id))}>
                Excluir foto
              </button>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.items.length >= 120 || value.categories.length === 0}
          onClick={() =>
            set("items", [
              ...value.items,
              { id: newId("foto"), categoryId: value.categories[0].id, imageUrl: "", alt: "", caption: "", shape: "square", tone: "navy", active: true },
            ])
          }
        >
          + Nova foto
        </button>
        {value.categories.length === 0 && <p className="adm-empty">Crie ao menos uma categoria para adicionar fotos.</p>}
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}
