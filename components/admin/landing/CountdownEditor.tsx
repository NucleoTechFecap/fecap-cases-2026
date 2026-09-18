"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, Row, SelectField, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"countdown">["content"];

const WHEN_FINISHED = [
  { value: "started", label: 'Mostrar "Evento iniciado"' },
  { value: "custom", label: "Mostrar mensagem personalizada" },
  { value: "hide", label: "Esconder a seção" },
] as const;

export function CountdownEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);
  const setLabel = (key: keyof Content["labels"], next: string) => set("labels", { ...value.labels, [key]: next });

  return (
    <>
      <Group title="Conteúdo">
        <TextAreaField label="Título" rows={2} value={value.title} maxLength={60} onChange={(next) => set("title", next)} hint="Use Enter para quebrar a linha." />
        <Row>
          <TextField label="Data alvo" type="date" value={value.targetDate} onChange={(next) => set("targetDate", next)} />
          <TextField label="Horário alvo" type="time" value={value.targetTime} onChange={(next) => set("targetTime", next)} />
        </Row>
        <p className="adm-note">O fuso horário é o definido em Configurações › Evento.</p>
      </Group>

      <Group title="Legendas">
        <Row>
          <TextField label="Dias" value={value.labels.days} maxLength={12} onChange={(next) => setLabel("days", next)} />
          <TextField label="Horas" value={value.labels.hours} maxLength={12} onChange={(next) => setLabel("hours", next)} />
        </Row>
        <Row>
          <TextField label="Minutos" value={value.labels.minutes} maxLength={12} onChange={(next) => setLabel("minutes", next)} />
          <TextField label="Segundos" value={value.labels.seconds} maxLength={12} onChange={(next) => setLabel("seconds", next)} />
        </Row>
      </Group>

      <Group title="Quando a contagem terminar">
        <SelectField label="Comportamento" value={value.whenFinished} options={WHEN_FINISHED} onChange={(next) => set("whenFinished", next)} />
        {value.whenFinished === "custom" && <TextField label="Mensagem" value={value.finishedMessage} maxLength={120} onChange={(next) => set("finishedMessage", next)} />}
      </Group>

      <Group title="Cores dos cartões">
        <Row>
          <ColorPicker label="Cartões" optional value={value.cardColor} onChange={(next) => set("cardColor", next)} />
          <ColorPicker label="Números" optional value={value.numberColor} onChange={(next) => set("numberColor", next)} />
        </Row>
        <Row>
          <ColorPicker label="Legendas" optional value={value.labelColor} onChange={(next) => set("labelColor", next)} />
          <ColorPicker label="Separadores" optional value={value.separatorColor} onChange={(next) => set("separatorColor", next)} />
        </Row>
      </Group>
    </>
  );
}
