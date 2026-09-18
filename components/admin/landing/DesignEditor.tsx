"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { ColorPicker } from "@/components/admin/ui/ColorPicker";
import { Group, Row, SelectField } from "@/components/admin/ui/Fields";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { FONT_LABELS } from "@/lib/landing/derive";
import { type DesignConfig, FONT_OPTIONS } from "@/lib/landing/schema";

const COLOR_FIELDS: { key: keyof DesignConfig["colors"]; label: string; hint?: string }[] = [
  { key: "primary", label: "Cor primária", hint: "Laranja do evento: FAQ, destaques e números." },
  { key: "secondary", label: "Cor secundária", hint: "Azul-marinho dos cartões e do rodapé." },
  { key: "accent", label: "Cor de destaque", hint: "Verde-limão de títulos e ícones." },
  { key: "highlight", label: "Cor de apoio", hint: "Azul vibrante da contagem e do contato." },
  { key: "cta", label: "Botões (CTA)" },
  { key: "background", label: "Fundo claro" },
  { key: "text", label: "Texto" },
  { key: "textMuted", label: "Texto secundário" },
  { key: "border", label: "Bordas" },
];

const FONTS = FONT_OPTIONS.map((value) => ({ value, label: FONT_LABELS[value] }));

/** Tudo aqui é opção pré-definida ou cor validada: não existe campo de CSS livre. */
export function DesignEditor({ value, onChange }: { value: DesignConfig; onChange: (next: DesignConfig) => void }) {
  const set = patcher(value, onChange);
  const defaults = DEFAULT_LANDING_CONFIG.design;

  return (
    <>
      <Group title="Cores do tema" description="Valem para o site inteiro. Cada seção ainda pode ter cores próprias.">
        {COLOR_FIELDS.map((field) => (
          <ColorPicker
            key={field.key}
            label={field.label}
            hint={field.hint}
            value={value.colors[field.key]}
            defaultValue={defaults.colors[field.key]}
            onChange={(next) => set("colors", { ...value.colors, [field.key]: next })}
          />
        ))}
      </Group>

      <Group title="Tipografia" description="Somente fontes aprovadas e já hospedadas pelo site.">
        <SelectField label="Fonte dos títulos" value={value.headingFont} options={FONTS} onChange={(next) => set("headingFont", next)} />
        <SelectField label="Fonte dos textos" value={value.bodyFont} options={FONTS} onChange={(next) => set("bodyFont", next)} />
        <Row>
          <SelectField
            label="Peso dos títulos"
            value={value.headingWeight}
            options={[
              { value: "700", label: "Negrito" },
              { value: "800", label: "Extra negrito" },
              { value: "900", label: "Black (padrão)" },
            ]}
            onChange={(next) => set("headingWeight", next)}
          />
          <SelectField
            label="Peso dos textos"
            value={value.bodyWeight}
            options={[
              { value: "400", label: "Regular (padrão)" },
              { value: "500", label: "Médio" },
            ]}
            onChange={(next) => set("bodyWeight", next)}
          />
        </Row>
      </Group>

      <Group title="Formas e espaços">
        <SelectField
          label="Formato dos botões"
          value={value.buttonShape}
          options={[
            { value: "square", label: "Reto (padrão)" },
            { value: "rounded", label: "Arredondado" },
            { value: "pill", label: "Pílula" },
          ]}
          onChange={(next) => set("buttonShape", next)}
        />
        <SelectField
          label="Cantos dos cartões"
          value={value.cardRadius}
          options={[
            { value: "none", label: "Retos" },
            { value: "small", label: "Suaves" },
            { value: "medium", label: "Arredondados (padrão)" },
            { value: "large", label: "Bem arredondados" },
          ]}
          onChange={(next) => set("cardRadius", next)}
        />
        <SelectField
          label="Largura do conteúdo"
          value={value.containerWidth}
          options={[
            { value: "narrow", label: "Estreita" },
            { value: "default", label: "Padrão" },
            { value: "wide", label: "Larga" },
          ]}
          onChange={(next) => set("containerWidth", next)}
        />
        <SelectField
          label="Espaçamento entre seções"
          value={value.sectionSpacing}
          options={[
            { value: "compact", label: "Compacto" },
            { value: "default", label: "Padrão" },
            { value: "spacious", label: "Amplo" },
          ]}
          onChange={(next) => set("sectionSpacing", next)}
        />
      </Group>
    </>
  );
}
