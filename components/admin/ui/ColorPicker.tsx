"use client";

import { useEffect, useId, useState } from "react";

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Cor padrão do tema. Se informada, mostra "Restaurar padrão". */
  defaultValue?: string;
  /** Permite "" = herdar a cor do tema. */
  optional?: boolean;
  hint?: string;
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ColorPicker({ label, value, onChange, defaultValue, optional = false, hint }: ColorPickerProps) {
  const id = useId();
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  function commit(next: string) {
    const normalized = next.startsWith("#") ? next : `#${next}`;
    setText(next);
    if (HEX.test(normalized)) onChange(normalized.toLowerCase());
  }

  const swatch = HEX.test(value) ? value : (defaultValue ?? "#ffffff");
  const canRestore = optional ? value !== "" : defaultValue !== undefined && value.toLowerCase() !== defaultValue.toLowerCase();

  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div className="adm-color">
        <input
          type="color"
          aria-label={`${label} — seletor de cor`}
          value={swatch}
          onChange={(event) => commit(event.target.value)}
        />
        <input
          id={id}
          className="adm-input"
          type="text"
          inputMode="text"
          spellCheck={false}
          maxLength={7}
          placeholder={optional ? "Padrão do tema" : "#000000"}
          value={text}
          onChange={(event) => commit(event.target.value.trim())}
          onBlur={() => setText(value)}
        />
        {canRestore && (
          <button type="button" className="adm-btn adm-btn-small" onClick={() => onChange(optional ? "" : (defaultValue ?? ""))}>
            Restaurar padrão
          </button>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}
