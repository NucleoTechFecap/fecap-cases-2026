"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { Group, Row, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import type { SectionOf } from "@/lib/landing/schema";

type Content = SectionOf<"contact">["content"];

export function ContactEditor({ value, onChange }: { value: Content; onChange: (next: Content) => void }) {
  const set = patcher(value, onChange);
  const setForm = (key: keyof Content["form"], next: string) => set("form", { ...value.form, [key]: next });

  return (
    <>
      <Group title="Textos">
        <TextField label="Título" value={value.title} maxLength={40} onChange={(next) => set("title", next)} />
        <TextAreaField label="Descrição" value={value.description} maxLength={300} onChange={(next) => set("description", next)} />
      </Group>

      <Group title="Canais exibidos" description="E-mail, telefone e endereço vêm de Configurações › Evento (sem duplicar informação).">
        <Toggle label="Mostrar e-mail" checked={value.showEmail} onChange={(next) => set("showEmail", next)} />
        <Toggle label="Mostrar telefone" checked={value.showPhone} onChange={(next) => set("showPhone", next)} />
        <Toggle label="Mostrar endereço" checked={value.showAddress} onChange={(next) => set("showAddress", next)} />
        {value.showAddress && <TextField label="Texto do endereço" value={value.addressLabel} maxLength={200} onChange={(next) => set("addressLabel", next)} hint="Em branco: usa o endereço completo do evento." />}
        <LinkField label="Link do Google Maps" value={value.mapsUrl} onChange={(next) => set("mapsUrl", next)} />
        <LinkField label="Link do WhatsApp" value={value.whatsapp} onChange={(next) => set("whatsapp", next)} hint="Ex.: https://wa.me/5511999999999" />
      </Group>

      <Group title="Formulário">
        <Row>
          <TextField label="Rótulo — nome" value={value.form.nameLabel} maxLength={30} onChange={(next) => setForm("nameLabel", next)} />
          <TextField label="Exemplo — nome" value={value.form.namePlaceholder} maxLength={60} onChange={(next) => setForm("namePlaceholder", next)} />
        </Row>
        <Row>
          <TextField label="Rótulo — e-mail" value={value.form.emailLabel} maxLength={30} onChange={(next) => setForm("emailLabel", next)} />
          <TextField label="Exemplo — e-mail" value={value.form.emailPlaceholder} maxLength={60} onChange={(next) => setForm("emailPlaceholder", next)} />
        </Row>
        <Row>
          <TextField label="Rótulo — mensagem" value={value.form.messageLabel} maxLength={30} onChange={(next) => setForm("messageLabel", next)} />
          <TextField label="Exemplo — mensagem" value={value.form.messagePlaceholder} maxLength={80} onChange={(next) => setForm("messagePlaceholder", next)} />
        </Row>
        <TextField label="Texto do botão" value={value.form.buttonLabel} maxLength={40} onChange={(next) => setForm("buttonLabel", next)} />
        <TextAreaField label="Mensagem de sucesso" rows={2} value={value.form.successMessage} maxLength={200} onChange={(next) => setForm("successMessage", next)} />
        <TextAreaField label="Mensagem de erro" rows={2} value={value.form.errorMessage} maxLength={200} onChange={(next) => setForm("errorMessage", next)} />
      </Group>
    </>
  );
}
