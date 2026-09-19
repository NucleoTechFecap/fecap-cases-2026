"use client";

import { useState } from "react";
import { newId } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, Row, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { PostSource } from "@/lib/blog/types";

const MAX_SOURCES = 40;

export function SourcesEditor({ sources, onChange }: { sources: PostSource[]; onChange: (next: PostSource[]) => void }) {
  const { confirm } = useFeedback();
  // Itens recém-criados nascem abertos. (Não dá para derivar de "título vazio": o item fecharia na 1ª letra.)
  const [openIds, setOpenIds] = useState<string[]>([]);
  const update = (id: string, patch: Partial<PostSource>) => onChange(sources.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  async function remove(source: PostSource) {
    const confirmed = await confirm({ title: "Remover fonte?", description: `"${source.title || "Fonte sem título"}" sairá da lista de referências.`, confirmLabel: "Remover", destructive: true });
    if (confirmed) onChange(sources.filter((item) => item.id !== source.id));
  }

  return (
    <Group title="Fontes e referências" description="Aparecem numeradas ao final do artigo. Links externos abrem em nova aba.">
      {sources.length === 0 && <p className="adm-empty">Nenhuma fonte adicionada.</p>}

      <SortableList
        label="Fontes e referências"
        items={sources}
        onReorder={onChange}
        renderItem={(source, index) => (
          <details
            className="adm-item"
            open={openIds.includes(source.id)}
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setOpenIds((current) => (isOpen ? [...new Set([...current, source.id])] : current.filter((id) => id !== source.id)));
            }}
          >
            <summary>
              <span>
                {index + 1}. {source.title || "Nova fonte"}
              </span>
              <em>{source.publisher}</em>
            </summary>
            <TextField label="Título da fonte" value={source.title} maxLength={200} onChange={(next) => update(source.id, { title: next })} />
            <Row>
              <TextField label="Veículo / publicação" value={source.publisher} maxLength={120} onChange={(next) => update(source.id, { publisher: next })} />
              <TextField label="Autor" value={source.author} maxLength={120} onChange={(next) => update(source.id, { author: next })} />
            </Row>
            <LinkField label="URL" value={source.url} onChange={(next) => update(source.id, { url: next })} hint="Opcional. Aceita https://" />
            <Row>
              <TextField label="Data da publicação" type="date" value={source.publishedAt} onChange={(next) => update(source.id, { publishedAt: next })} />
              <TextField label="Data de acesso" type="date" value={source.accessedAt} onChange={(next) => update(source.id, { accessedAt: next })} />
            </Row>
            <TextAreaField label="Observação" rows={2} value={source.notes} maxLength={300} onChange={(next) => update(source.id, { notes: next })} />
            <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => remove(source)}>
              Remover fonte
            </button>
          </details>
        )}
      />

      <button
        type="button"
        className="adm-btn adm-btn-add"
        disabled={sources.length >= MAX_SOURCES}
        onClick={() => {
          const id = newId("src");
          setOpenIds((current) => [...current, id]);
          onChange([...sources, { id, title: "", publisher: "", author: "", url: "", publishedAt: "", accessedAt: "", notes: "" }]);
        }}
      >
        + Adicionar fonte
      </button>
    </Group>
  );
}
