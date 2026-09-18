"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { LinkListEditor } from "@/components/admin/landing/LinkListEditor";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import type { FooterConfig } from "@/lib/landing/schema";

export function FooterEditor({ value, onChange }: { value: FooterConfig; onChange: (next: FooterConfig) => void }) {
  const set = patcher(value, onChange);

  return (
    <>
      <Group title="Marca">
        <ImageUploader label="Logo" folder="footer" value={value.logoUrl} defaultValue={DEFAULT_LANDING_CONFIG.footer.logoUrl} onChange={(next) => set("logoUrl", next)} hint="Use PNG ou SVG com fundo transparente: o logo é pintado com a cor abaixo." />
        <ColorPicker label="Cor do logo" optional value={value.logoColor} onChange={(next) => set("logoColor", next)} />
        <TextField label="Frase" value={value.tagline} maxLength={120} onChange={(next) => set("tagline", next)} />
        <TextField label="Palavra gigante" value={value.giantWord} maxLength={16} onChange={(next) => set("giantWord", next)} hint="Texto decorativo no rodapé. Em branco para ocultar." />
      </Group>

      <Group title="Links rápidos">
        <TextField label="Título da coluna" value={value.linksTitle} maxLength={40} onChange={(next) => set("linksTitle", next)} />
        <LinkListEditor links={value.links} max={12} onChange={(next) => set("links", next)} />
      </Group>

      <Group title="Redes sociais">
        <Toggle label="Mostrar redes sociais" hint="As redes são cadastradas em Configurações." checked={value.showSocial} onChange={(next) => set("showSocial", next)} />
        <TextField label="Título da coluna" value={value.socialTitle} maxLength={40} onChange={(next) => set("socialTitle", next)} />
      </Group>

      <Group title="Créditos / copyright" description="Até 4 linhas.">
        <SortableList
          label="Linhas de crédito"
          items={value.credits}
          onReorder={(next) => set("credits", next)}
          renderItem={(line) => (
            <div className="adm-inline">
              <input
                className="adm-input"
                aria-label="Linha de crédito"
                maxLength={200}
                value={line.text}
                onChange={(event) => set("credits", value.credits.map((item) => (item.id === line.id ? { ...item, text: event.target.value } : item)))}
              />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("credits", value.credits.filter((item) => item.id !== line.id))}>
                Remover
              </button>
            </div>
          )}
        />
        <button type="button" className="adm-btn adm-btn-add" disabled={value.credits.length >= 4} onClick={() => set("credits", [...value.credits, { id: newId("c"), text: "© 2026 FECAP Cases" }])}>
          + Adicionar linha
        </button>
      </Group>

      <Group title="Cores">
        <ColorPicker label="Cor de fundo" optional value={value.backgroundColor} onChange={(next) => set("backgroundColor", next)} />
        <ColorPicker label="Cor dos textos" optional value={value.textColor} onChange={(next) => set("textColor", next)} />
      </Group>
    </>
  );
}
