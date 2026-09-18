"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, Row, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"about">["content"];
type Stat = Content["stats"][number];

export function AboutEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);
  const updateStat = (id: string, patch: Partial<Stat>) => set("stats", value.stats.map((stat) => (stat.id === id ? { ...stat, ...patch } : stat)));

  return (
    <>
      <Group title="Textos">
        <TextField label="Texto de apoio" value={value.eyebrow} maxLength={60} onChange={(next) => set("eyebrow", next)} />
        <TextAreaField label="Título" rows={2} value={value.title} maxLength={80} onChange={(next) => set("title", next)} />
        <TextAreaField label="Título em destaque (colorido)" rows={2} value={value.titleHighlight} maxLength={80} onChange={(next) => set("titleHighlight", next)} />
        <TextAreaField label="Descrição" rows={5} value={value.description} maxLength={900} onChange={(next) => set("description", next)} />
      </Group>

      <Group title="Estatísticas" description="Arraste para reordenar. Máximo de 6.">
        <SortableList
          label="Estatísticas"
          items={value.stats}
          onReorder={(next) => set("stats", next)}
          renderItem={(stat) => (
            <details className="adm-item">
              <summary>
                <strong>{stat.value || "—"}</strong>
                <em>{stat.label}</em>
              </summary>
              <Row>
                <TextField label="Número" value={stat.value} maxLength={8} onChange={(next) => updateStat(stat.id, { value: next })} hint='Ex.: 15+' />
                <TextField label="Legenda" value={stat.label} maxLength={40} onChange={(next) => updateStat(stat.id, { label: next })} />
              </Row>
              <TextField label="Descrição (opcional)" value={stat.description} maxLength={120} onChange={(next) => updateStat(stat.id, { description: next })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("stats", value.stats.filter((item) => item.id !== stat.id))}>
                Remover estatística
              </button>
            </details>
          )}
        />
        <button type="button" className="adm-btn adm-btn-add" disabled={value.stats.length >= 6} onClick={() => set("stats", [...value.stats, { id: newId("st"), value: "10+", label: "nova estatística", description: "" }])}>
          + Adicionar estatística
        </button>
      </Group>

      <Group title="Visual">
        <ImageUploader label="Imagem (opcional)" folder="miscellaneous" value={value.imageUrl} onChange={(next) => set("imageUrl", next)} />
        <ColorPicker label="Cor do cartão" optional value={value.cardColor} onChange={(next) => set("cardColor", next)} />
      </Group>
    </>
  );
}
