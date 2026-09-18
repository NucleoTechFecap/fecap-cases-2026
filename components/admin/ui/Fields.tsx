"use client";

import { useId } from "react";

type BaseProps = { label: string; hint?: string };

export function Field({ label, hint, htmlFor, children }: BaseProps & { htmlFor?: string; children: React.ReactNode }) {
  return (
    <div className="adm-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

type TextFieldProps = BaseProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  type?: "text" | "email" | "url" | "date" | "time" | "tel";
};

export function TextField({ label, hint, value, onChange, maxLength, placeholder, type = "text" }: TextFieldProps) {
  const id = useId();

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <input
        id={id}
        className="adm-input"
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({ label, hint, value, onChange, maxLength, rows = 3 }: TextFieldProps & { rows?: number }) {
  const id = useId();

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <textarea
        id={id}
        className="adm-input"
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
      {maxLength && (
        <small className="adm-counter">
          {value.length}/{maxLength}
        </small>
      )}
    </Field>
  );
}

type SelectFieldProps<T extends string> = BaseProps & {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
};

export function SelectField<T extends string>({ label, hint, value, onChange, options }: SelectFieldProps<T>) {
  const id = useId();

  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} className="adm-input" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

type RangeFieldProps = BaseProps & {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
};

/** Números sempre por slider com limites: o admin não consegue digitar "20000px". */
export function RangeField({ label, hint, value, onChange, min, max, step = 1, unit = "" }: RangeFieldProps) {
  const id = useId();

  return (
    <Field label={`${label}: ${value}${unit}`} hint={hint} htmlFor={id}>
      <input
        id={id}
        className="adm-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Field>
  );
}

export function Toggle({ label, hint, checked, onChange }: BaseProps & { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="adm-toggle-track" aria-hidden="true" />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}

export function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="adm-group">
      <legend>{title}</legend>
      {description && <p className="adm-group-description">{description}</p>}
      {children}
    </fieldset>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="adm-row">{children}</div>;
}
