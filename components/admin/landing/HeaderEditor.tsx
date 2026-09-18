"use client";

import { ButtonEditor } from "@/components/admin/landing/ButtonEditor";
import { patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { LinkListEditor } from "@/components/admin/landing/LinkListEditor";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, RangeField, Row, SelectField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import type { HeaderConfig } from "@/lib/landing/schema";

const BACKGROUNDS = [
  { value: "gradient", label: "Degradê" },
  { value: "solid", label: "Cor sólida" },
  { value: "transparent", label: "Transparente" },
] as const;

export function HeaderEditor({ value, onChange }: { value: HeaderConfig; onChange: (next: HeaderConfig) => void }) {
  const set = patcher(value, onChange);
  const defaults = DEFAULT_LANDING_CONFIG.header;

  return (
    <>
      <Group title="Logo">
        <ImageUploader label="Logo do header" folder="miscellaneous" value={value.logoUrl} defaultValue={defaults.logoUrl} onChange={(next) => set("logoUrl", next)} />
        <TextField label="Descrição do logo (acessibilidade)" value={value.logoAlt} maxLength={120} onChange={(next) => set("logoAlt", next)} />
        <RangeField label="Largura do logo" unit="px" min={60} max={220} value={value.logoWidth} onChange={(next) => set("logoWidth", next)} hint="A altura acompanha a proporção da imagem." />
      </Group>

      <Group title="Links do menu" description="Arraste para reordenar. O mesmo menu é usado no celular.">
        <LinkListEditor links={value.links} max={10} onChange={(next) => set("links", next)} />
      </Group>

      <Group title="Aparência">
        <SelectField label="Fundo" value={value.background} options={BACKGROUNDS} onChange={(next) => set("background", next)} />
        {value.background !== "transparent" && (
          <Row>
            <ColorPicker label={value.background === "gradient" ? "Cor inicial" : "Cor"} value={value.backgroundColor} defaultValue={defaults.backgroundColor} onChange={(next) => set("backgroundColor", next)} />
            {value.background === "gradient" && (
              <ColorPicker label="Cor final" value={value.backgroundColorEnd} defaultValue={defaults.backgroundColorEnd} onChange={(next) => set("backgroundColorEnd", next)} />
            )}
          </Row>
        )}
        <ColorPicker label="Cor ao rolar a página" optional value={value.scrolledColor} onChange={(next) => set("scrolledColor", next)} hint="Útil com o header transparente." />
        <ColorPicker label="Cor dos textos" optional value={value.textColor} onChange={(next) => set("textColor", next)} />
      </Group>

      <Group title="Comportamento">
        <Toggle label="Header fixo no topo" checked={value.fixed} onChange={(next) => set("fixed", next)} />
        {value.fixed && <Toggle label="Esconder ao rolar para baixo" hint="Reaparece ao rolar para cima." checked={value.hideOnScroll} onChange={(next) => set("hideOnScroll", next)} />}
        <Toggle label="Mostrar redes sociais" hint="As redes são cadastradas em Configurações." checked={value.showSocial} onChange={(next) => set("showSocial", next)} />
      </Group>

      <ButtonEditor title="Botão de destaque (CTA)" value={value.cta} onChange={(next) => set("cta", next)} />
    </>
  );
}
