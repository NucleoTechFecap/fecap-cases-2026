"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, SelectField } from "@/components/admin/ui/Fields";
import type { SectionStyles } from "@/lib/landing/schema";

const SPACING = [
  { value: "compact", label: "Compacto" },
  { value: "default", label: "Padrão" },
  { value: "spacious", label: "Amplo" },
] as const;

type SectionStyleEditorProps = { value: SectionStyles; onChange: (next: SectionStyles) => void; withSpacing?: boolean };

export function SectionStyleEditor({ value, onChange, withSpacing = true }: SectionStyleEditorProps) {
  const set = patcher(value, onChange);

  return (
    <Group title="Aparência da seção" description="Deixe em branco para usar as cores do tema (aba Design).">
      <ColorPicker label="Cor de fundo" optional value={value.backgroundColor} onChange={(next) => set("backgroundColor", next)} />
      <ColorPicker label="Cor do texto" optional value={value.textColor} onChange={(next) => set("textColor", next)} />
      <ColorPicker label="Cor de destaque" optional value={value.accentColor} onChange={(next) => set("accentColor", next)} />
      {withSpacing && <SelectField label="Espaçamento vertical" value={value.spacing} options={SPACING} onChange={(next) => set("spacing", next)} />}
    </Group>
  );
}
