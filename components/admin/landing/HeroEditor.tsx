"use client";

import { ButtonEditor } from "@/components/admin/landing/ButtonEditor";
import { patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, RangeField, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { defaultSection } from "@/lib/landing/defaults";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"hero">["content"];

export function HeroEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);
  const defaults = defaultSection("hero").content;

  return (
    <>
      <Group title="Textos">
        <TextField label="Texto de apoio (acima do logo)" value={value.eyebrow} maxLength={80} onChange={(next) => set("eyebrow", next)} />
        <TextField label="Título" value={value.title} maxLength={80} onChange={(next) => set("title", next)} hint="Opcional. Aparece abaixo do logo." />
        <TextAreaField label="Descrição" value={value.description} maxLength={300} onChange={(next) => set("description", next)} />
        <TextField label="Local" value={value.locationLabel} maxLength={80} onChange={(next) => set("locationLabel", next)} hint="Em branco: usa o local das Configurações do evento." />
        <TextField label="Data" value={value.dateLabel} maxLength={80} onChange={(next) => set("dateLabel", next)} hint="Em branco: gerada pelas datas do evento." />
      </Group>

      <Group title="Imagens">
        <ImageUploader label="Logo / imagem principal" folder="hero" value={value.logoUrl} defaultValue={defaults.logoUrl} onChange={(next) => set("logoUrl", next)} />
        <TextField label="Descrição da imagem (acessibilidade)" value={value.logoAlt} maxLength={120} onChange={(next) => set("logoAlt", next)} />
        <ImageUploader label="Imagem de fundo" folder="hero" value={value.backgroundImage} defaultValue={defaults.backgroundImage} onChange={(next) => set("backgroundImage", next)} />
      </Group>

      <Group title="Sobreposição" description="Camada de cor sobre a foto para garantir leitura dos textos.">
        <ColorPicker label="Cor da sobreposição" value={value.overlayColor} defaultValue={defaults.overlayColor} onChange={(next) => set("overlayColor", next)} />
        <RangeField label="Intensidade" unit="%" min={0} max={90} value={value.overlayOpacity} onChange={(next) => set("overlayOpacity", next)} />
        <ColorPicker label="Cor do texto de apoio" optional value={value.eyebrowColor} onChange={(next) => set("eyebrowColor", next)} />
      </Group>

      <ButtonEditor title="Botão principal" value={value.primaryButton} onChange={(next) => set("primaryButton", next)} />
      <ButtonEditor title="Botão secundário" value={value.secondaryButton} onChange={(next) => set("secondaryButton", next)} />
    </>
  );
}
