"use client";

import { Field } from "@/components/admin/ui/Fields";
import { isSafeUrl } from "@/lib/landing/urls";
import { useId } from "react";

type LinkFieldProps = { label: string; value: string; onChange: (value: string) => void; hint?: string };

/** Campo de link com validação imediata (a mesma regra é reaplicada no servidor). */
export function LinkField({ label, value, onChange, hint }: LinkFieldProps) {
  const id = useId();
  const valid = isSafeUrl(value);

  return (
    <Field
      label={label}
      htmlFor={id}
      hint={valid ? (hint ?? "Aceita https://, /pagina, #ancora, mailto: e tel:") : undefined}
    >
      <input
        id={id}
        className="adm-input"
        type="text"
        inputMode="url"
        spellCheck={false}
        maxLength={500}
        value={value}
        aria-invalid={!valid}
        placeholder="https://… ou /pagina"
        onChange={(event) => onChange(event.target.value.trim())}
      />
      {!valid && <small className="adm-error">Link inválido. Use https://, /pagina, #ancora, mailto: ou tel:.</small>}
    </Field>
  );
}
