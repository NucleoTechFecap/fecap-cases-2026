"use client";

import { useId, useState } from "react";
import { saveTag } from "@/app/admin/blog/actions";
import { useFeedback } from "@/components/admin/ui/Feedback";
import type { BlogTag } from "@/lib/blog/types";

type TagPickerProps = { allTags: BlogTag[]; selected: string[]; onChange: (ids: string[]) => void; onTagCreated: (tag: BlogTag) => void; disabled: boolean };

const MAX_TAGS = 20;

/** Escolhe tags existentes ou cria novas na hora (Enter ou vírgula). */
export function TagPicker({ allTags, selected, onChange, onTagCreated, disabled }: TagPickerProps) {
  const { toast } = useFeedback();
  const inputId = useId();
  const listId = useId();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const chosen = selected.flatMap((id) => allTags.find((tag) => tag.id === id) ?? []);
  const suggestions = allTags.filter((tag) => !selected.includes(tag.id));

  async function add(raw: string) {
    const name = raw.replace(/,/g, " ").trim();
    if (!name || busy) return;
    if (selected.length >= MAX_TAGS) return toast(`Use no máximo ${MAX_TAGS} tags.`, "error");

    const existing = allTags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!selected.includes(existing.id)) onChange([...selected, existing.id]);
      return setText("");
    }

    setBusy(true);
    const result = await saveTag(null, { name });
    setBusy(false);
    if (!result.ok) return toast(result.error, "error");

    onTagCreated(result.data);
    if (!selected.includes(result.data.id)) onChange([...selected, result.data.id]);
    setText("");
  }

  return (
    <div className="adm-field">
      <label htmlFor={inputId}>Tags</label>

      {chosen.length > 0 && (
        <ul className="adm-chips" aria-label="Tags selecionadas">
          {chosen.map((tag) => (
            <li key={tag.id}>
              {tag.name}
              <button type="button" aria-label={`Remover tag ${tag.name}`} disabled={disabled} onClick={() => onChange(selected.filter((id) => id !== tag.id))}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="adm-inline">
        <input
          id={inputId}
          className="adm-input"
          list={listId}
          value={text}
          maxLength={40}
          disabled={disabled || busy}
          placeholder="Digite e pressione Enter"
          onChange={(event) => (event.target.value.endsWith(",") ? void add(event.target.value) : setText(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void add(text);
            }
          }}
        />
        <button type="button" className="adm-btn adm-btn-small" disabled={disabled || busy || text.trim() === ""} onClick={() => add(text)}>
          {busy ? "Criando…" : "Adicionar"}
        </button>
      </div>
      <datalist id={listId}>
        {suggestions.map((tag) => (
          <option value={tag.name} key={tag.id} />
        ))}
      </datalist>
      <small>Tags novas são criadas automaticamente.</small>
    </div>
  );
}
