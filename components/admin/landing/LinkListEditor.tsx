"use client";

import { newId } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { CmsLink } from "@/lib/landing/schema";

type LinkListEditorProps = { links: CmsLink[]; onChange: (links: CmsLink[]) => void; max: number; addLabel?: string };

export function LinkListEditor({ links, onChange, max, addLabel = "Adicionar link" }: LinkListEditorProps) {
  const { confirm } = useFeedback();

  const update = (id: string, patch: Partial<CmsLink>) => onChange(links.map((link) => (link.id === id ? { ...link, ...patch } : link)));

  async function remove(link: CmsLink) {
    const confirmed = await confirm({
      title: "Excluir link?",
      description: `O link "${link.label || "sem título"}" será removido.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) onChange(links.filter((item) => item.id !== link.id));
  }

  return (
    <div>
      <SortableList
        label="Links"
        items={links}
        onReorder={onChange}
        renderItem={(link) => (
          <details className="adm-item">
            <summary>
              <span data-muted={!link.active}>{link.label || "Novo link"}</span>
              <em>{link.url}</em>
            </summary>
            <TextField label="Texto" value={link.label} maxLength={40} onChange={(next) => update(link.id, { label: next })} />
            <LinkField label="Destino" value={link.url} onChange={(next) => update(link.id, { url: next })} />
            <Toggle label="Abrir em nova aba" checked={link.newTab} onChange={(next) => update(link.id, { newTab: next })} />
            <Toggle label="Visível no site" checked={link.active} onChange={(next) => update(link.id, { active: next })} />
            <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => remove(link)}>
              Excluir link
            </button>
          </details>
        )}
      />

      <button
        type="button"
        className="adm-btn adm-btn-add"
        disabled={links.length >= max}
        onClick={() => onChange([...links, { id: newId("link"), label: "Novo link", url: "/", newTab: false, active: true }])}
      >
        + {addLabel}
      </button>
    </div>
  );
}
