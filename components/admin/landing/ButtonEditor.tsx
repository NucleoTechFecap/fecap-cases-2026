"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, Row, SelectField, TextField, Toggle } from "@/components/admin/ui/Fields";
import type { CmsButton } from "@/lib/landing/schema";

const STYLES = [
  { value: "filled", label: "Preenchido" },
  { value: "outline", label: "Contorno" },
  { value: "ghost", label: "Somente texto" },
] as const;

/** Editor reutilizável de CTA (hero, header, programação…). */
export function ButtonEditor({ title, value, onChange }: { title: string; value: CmsButton; onChange: (next: CmsButton) => void }) {
  const set = patcher(value, onChange);

  return (
    <Group title={title}>
      <Toggle label="Exibir botão" checked={value.enabled} onChange={(next) => set("enabled", next)} />

      {value.enabled && (
        <>
          <TextField label="Texto" value={value.label} maxLength={60} onChange={(next) => set("label", next)} />
          <LinkField label="Link" value={value.url} onChange={(next) => set("url", next)} />
          <Toggle label="Abrir em nova aba" checked={value.newTab} onChange={(next) => set("newTab", next)} />
          <SelectField label="Estilo" value={value.style} options={STYLES} onChange={(next) => set("style", next)} />
          <Row>
            <ColorPicker label="Cor do botão" optional value={value.color} onChange={(next) => set("color", next)} />
            <ColorPicker label="Cor do texto" optional value={value.textColor} onChange={(next) => set("textColor", next)} />
          </Row>
          <ColorPicker label="Cor da borda" optional value={value.borderColor} onChange={(next) => set("borderColor", next)} />
        </>
      )}
    </Group>
  );
}
