"use client";

import { logItemAction } from "@/app/admin/actions";
import { newId, patcher } from "@/components/admin/landing/helpers";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"faq">["content"];
type Item = Content["items"][number];

export function FaqEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const { confirm } = useFeedback();
  const set = patcher(value, onChange);
  const update = (id: string, patch: Partial<Item>) => set("items", value.items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  async function remove(item: Item) {
    const confirmed = await confirm({
      title: "Excluir pergunta?",
      description: `"${item.question || "Pergunta sem título"}" será removida.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    set("items", value.items.filter((entry) => entry.id !== item.id));
    void logItemAction("faq_deleted", item.question);
  }

  return (
    <>
      <Group title="Cabeçalho da seção">
        <TextField label="Texto de apoio" value={value.eyebrow} maxLength={40} onChange={(next) => set("eyebrow", next)} />
        <TextAreaField label="Título" rows={2} value={value.title} maxLength={80} onChange={(next) => set("title", next)} hint="Use Enter para quebrar a linha." />
        <TextAreaField label="Título em destaque (colorido)" rows={2} value={value.titleHighlight} maxLength={80} onChange={(next) => set("titleHighlight", next)} />
        <TextAreaField label="Descrição" value={value.description} maxLength={300} onChange={(next) => set("description", next)} />
      </Group>

      <Group title="Perguntas frequentes" description="A numeração (01, 02…) segue a ordem desta lista.">
        <SortableList
          label="Perguntas"
          items={value.items}
          onReorder={(next) => set("items", next)}
          renderItem={(item, index) => (
            <details className="adm-item">
              <summary>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <span data-muted={!item.active}>{item.question || "Nova pergunta"}</span>
              </summary>
              <TextField label="Pergunta" value={item.question} maxLength={200} onChange={(next) => update(item.id, { question: next })} />
              <TextAreaField label="Resposta" rows={4} value={item.answer} maxLength={1200} onChange={(next) => update(item.id, { answer: next })} />
              <Toggle label="Visível no site" checked={item.active} onChange={(next) => update(item.id, { active: next })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => remove(item)}>
                Excluir pergunta
              </button>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.items.length >= 40}
          onClick={() => {
            set("items", [...value.items, { id: newId("q"), question: "Nova pergunta", answer: "", active: true }]);
            void logItemAction("faq_created", "Nova pergunta");
          }}
        >
          + Nova pergunta
        </button>
      </Group>
    </>
  );
}
