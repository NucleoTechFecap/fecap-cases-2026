"use client";

import { useState } from "react";
import { newId } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, SelectField, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import { type PostRelatedLink, RELATED_LINK_TYPES, type RelatedLinkType } from "@/lib/blog/types";

const MAX_LINKS = 20;

export function RelatedLinksEditor({ links, onChange }: { links: PostRelatedLink[]; onChange: (next: PostRelatedLink[]) => void }) {
  const { confirm } = useFeedback();
  // Itens recém-criados nascem abertos. (Não dá para derivar de "título vazio": o item fecharia na 1ª letra.)
  const [openIds, setOpenIds] = useState<string[]>([]);
  const update = (id: string, patch: Partial<PostRelatedLink>) => onChange(links.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  async function remove(link: PostRelatedLink) {
    const confirmed = await confirm({ title: "Remover link?", description: `"${link.title || "Link sem título"}" sairá dos links relacionados.`, confirmLabel: "Remover", destructive: true });
    if (confirmed) onChange(links.filter((item) => item.id !== link.id));
  }

  return (
    <Group title="Links relacionados" description="Cards exibidos ao final do artigo (inscrição, site oficial, documentação…).">
      {links.length === 0 && <p className="adm-empty">Nenhum link adicionado.</p>}

      <SortableList
        label="Links relacionados"
        items={links}
        onReorder={onChange}
        renderItem={(link) => (
          <details
            className="adm-item"
            open={openIds.includes(link.id)}
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setOpenIds((current) => (isOpen ? [...new Set([...current, link.id])] : current.filter((id) => id !== link.id)));
            }}
          >
            <summary>
              <span>{link.title || "Novo link"}</span>
              <em>{link.url}</em>
            </summary>
            <TextField label="Título" value={link.title} maxLength={120} onChange={(next) => update(link.id, { title: next })} />
            <LinkField label="URL" value={link.url} onChange={(next) => update(link.id, { url: next })} />
            <SelectField<RelatedLinkType> label="Tipo" value={link.type} options={RELATED_LINK_TYPES} onChange={(next) => update(link.id, { type: next })} />
            <TextAreaField label="Descrição" rows={2} value={link.description} maxLength={200} onChange={(next) => update(link.id, { description: next })} />
            <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => remove(link)}>
              Remover link
            </button>
          </details>
        )}
      />

      <button
        type="button"
        className="adm-btn adm-btn-add"
        disabled={links.length >= MAX_LINKS}
        onClick={() => {
          const id = newId("link");
          setOpenIds((current) => [...current, id]);
          onChange([...links, { id, title: "", url: "", description: "", type: "more" }]);
        }}
      >
        + Adicionar link
      </button>
    </Group>
  );
}
