"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { Group, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { PageButton, PageCard, PageHeading, PageHero, PageLine, PageSeo } from "@/lib/landing/pages-schema";

type EditorProps<T> = { value: T; onChange: (next: T) => void };

export function HeroFields({ value, onChange }: EditorProps<PageHero>) {
  const set = patcher(value, onChange);

  return (
    <Group title="Topo da página">
      <TextField label="Texto de apoio" value={value.eyebrow} maxLength={80} onChange={(next) => set("eyebrow", next)} />
      <TextField label="Título" value={value.title} maxLength={80} onChange={(next) => set("title", next)} />
      <TextAreaField label="Texto de abertura" value={value.lead} maxLength={320} onChange={(next) => set("lead", next)} />
    </Group>
  );
}

/** Campos de um cabeçalho de bloco (sem o Group em volta, para compor com as listas). */
export function HeadingFields({ value, onChange }: EditorProps<PageHeading>) {
  const set = patcher(value, onChange);

  return (
    <>
      <TextField label="Texto de apoio" value={value.eyebrow} maxLength={60} onChange={(next) => set("eyebrow", next)} />
      <TextAreaField label="Título" rows={2} value={value.title} maxLength={80} onChange={(next) => set("title", next)} hint="Use Enter para quebrar a linha." />
      <TextAreaField label="Título em destaque (colorido)" rows={2} value={value.titleHighlight} maxLength={80} onChange={(next) => set("titleHighlight", next)} />
      <Toggle label="Destaque na linha de baixo" checked={value.highlightOnNewLine} onChange={(next) => set("highlightOnNewLine", next)} />
      <TextAreaField label="Descrição" value={value.text} maxLength={400} onChange={(next) => set("text", next)} />
    </>
  );
}

export function PageButtonFields({ title, value, onChange }: EditorProps<PageButton> & { title: string }) {
  const set = patcher(value, onChange);

  return (
    <Group title={title}>
      <Toggle label="Mostrar botão" checked={value.enabled} onChange={(next) => set("enabled", next)} />
      <TextField label="Texto do botão" value={value.label} maxLength={60} onChange={(next) => set("label", next)} />
      <LinkField label="Link" value={value.url} onChange={(next) => set("url", next)} />
      <Toggle label="Abrir em nova aba" checked={value.newTab} onChange={(next) => set("newTab", next)} />
    </Group>
  );
}

export function PageSeoFields({ value, onChange }: EditorProps<PageSeo>) {
  const set = patcher(value, onChange);

  return (
    <Group title="Google e compartilhamento" description="Título da aba do navegador e texto que aparece no Google e ao compartilhar o link desta página.">
      <TextField label="Título da página" value={value.title} maxLength={70} onChange={(next) => set("title", next)} />
      <TextAreaField label="Descrição" value={value.description} maxLength={200} onChange={(next) => set("description", next)} />
    </Group>
  );
}

type CardListProps = EditorProps<PageCard[]> & {
  label: string;
  addLabel: string;
  max: number;
  /** Rótulo do campo curto acima do título ("Número", "Etiqueta"…). Omitido = campo oculto. */
  tagLabel?: string;
  idPrefix: string;
};

export function CardListEditor({ value, onChange, label, addLabel, max, tagLabel, idPrefix }: CardListProps) {
  const update = (id: string, patch: Partial<PageCard>) => onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <>
      <SortableList
        label={label}
        items={value}
        onReorder={onChange}
        renderItem={(item) => (
          <details className="adm-item">
            <summary>
              {tagLabel && item.tag && <strong>{item.tag}</strong>}
              <span>{item.title || "Sem título"}</span>
            </summary>
            {tagLabel && <TextField label={tagLabel} value={item.tag} maxLength={24} onChange={(next) => update(item.id, { tag: next })} />}
            <TextField label="Título" value={item.title} maxLength={80} onChange={(next) => update(item.id, { title: next })} />
            <TextAreaField label="Texto" value={item.text} maxLength={400} onChange={(next) => update(item.id, { text: next })} />
            <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))}>
              Excluir
            </button>
          </details>
        )}
      />
      <button
        type="button"
        className="adm-btn adm-btn-add"
        disabled={value.length >= max}
        onClick={() => onChange([...value, { id: newId(idPrefix), tag: "", title: "Novo item", text: "" }])}
      >
        + {addLabel}
      </button>
    </>
  );
}

type LineListProps = EditorProps<PageLine[]> & { label: string; addLabel: string; max: number; maxLength: number; idPrefix: string; rows?: number };

export function LineListEditor({ value, onChange, label, addLabel, max, maxLength, idPrefix, rows = 2 }: LineListProps) {
  return (
    <>
      <SortableList
        label={label}
        items={value}
        onReorder={onChange}
        renderItem={(item, index) => (
          <div className="adm-line-item">
            <TextAreaField
              label={`${label} ${index + 1}`}
              rows={rows}
              value={item.text}
              maxLength={maxLength}
              onChange={(next) => onChange(value.map((entry) => (entry.id === item.id ? { ...entry, text: next } : entry)))}
            />
            <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))}>
              Excluir
            </button>
          </div>
        )}
      />
      <button type="button" className="adm-btn adm-btn-add" disabled={value.length >= max} onClick={() => onChange([...value, { id: newId(idPrefix), text: "" }])}>
        + {addLabel}
      </button>
    </>
  );
}
