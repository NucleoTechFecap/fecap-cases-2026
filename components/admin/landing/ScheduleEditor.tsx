"use client";

import { ButtonEditor } from "@/components/admin/landing/ButtonEditor";
import { patcher } from "@/components/admin/landing/helpers";
import { Group, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"schedule">["content"];

export function ScheduleEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);

  return (
    <>
      <Group title="Chamada para a programação" description="Bloco que leva o visitante à página completa de programação.">
        <TextField label="Texto de apoio" value={value.eyebrow} maxLength={60} onChange={(next) => set("eyebrow", next)} />
        <TextAreaField label="Título" rows={2} value={value.title} maxLength={80} onChange={(next) => set("title", next)} />
        <TextAreaField label="Título em destaque (colorido)" rows={2} value={value.titleHighlight} maxLength={80} onChange={(next) => set("titleHighlight", next)} />
        <TextAreaField label="Descrição" value={value.description} maxLength={400} onChange={(next) => set("description", next)} />
      </Group>
      <ButtonEditor title="Botão" value={value.button} onChange={(next) => set("button", next)} />
    </>
  );
}
