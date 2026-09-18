"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { Group, RangeField, SelectField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"marquee">["content"];

const DIRECTIONS = [
  { value: "left", label: "Para a esquerda" },
  { value: "right", label: "Para a direita" },
] as const;

export function MarqueeEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);

  return (
    <>
      <Group title="Palavras da faixa" description="Arraste para reordenar.">
        <SortableList
          label="Palavras da faixa"
          items={value.items}
          onReorder={(next) => set("items", next)}
          renderItem={(item) => (
            <div className="adm-inline">
              <input
                className="adm-input"
                aria-label="Texto"
                maxLength={40}
                value={item.text}
                onChange={(event) => set("items", value.items.map((entry) => (entry.id === item.id ? { ...entry, text: event.target.value } : entry)))}
              />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" aria-label={`Remover ${item.text}`} onClick={() => set("items", value.items.filter((entry) => entry.id !== item.id))}>
                Remover
              </button>
            </div>
          )}
        />
        <button type="button" className="adm-btn adm-btn-add" disabled={value.items.length >= 16} onClick={() => set("items", [...value.items, { id: newId("m"), text: "NOVA PALAVRA" }])}>
          + Adicionar palavra
        </button>
      </Group>

      <Group title="Animação">
        <Toggle label="Faixa em movimento" checked={value.animated} onChange={(next) => set("animated", next)} />
        {value.animated && (
          <>
            <RangeField label="Tempo de uma volta" unit="s" min={10} max={80} value={value.speed} onChange={(next) => set("speed", next)} hint="Menor = mais rápido. Limitado para não causar desconforto." />
            <SelectField label="Direção" value={value.direction} options={DIRECTIONS} onChange={(next) => set("direction", next)} />
          </>
        )}
      </Group>
    </>
  );
}
