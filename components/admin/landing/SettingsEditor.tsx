"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { SOCIAL_LABELS } from "@/components/landing/cms/SocialIcon";
import { Group, Row, SelectField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import { type EventConfig, SOCIAL_NETWORKS, type SocialLink, TIMEZONES } from "@/lib/landing/schema";

const TIMEZONE_LABELS: Record<keyof typeof TIMEZONES, string> = {
  "America/Sao_Paulo": "Brasília (UTC−3)",
  "America/Manaus": "Manaus (UTC−4)",
  "America/Rio_Branco": "Rio Branco (UTC−5)",
  "America/Noronha": "Fernando de Noronha (UTC−2)",
  UTC: "UTC",
};

const TIMEZONE_OPTIONS = (Object.keys(TIMEZONES) as (keyof typeof TIMEZONES)[]).map((value) => ({ value, label: TIMEZONE_LABELS[value] }));
const NETWORK_OPTIONS = SOCIAL_NETWORKS.map((value) => ({ value, label: SOCIAL_LABELS[value] }));

type SettingsEditorProps = {
  event: EventConfig;
  onEventChange: (next: EventConfig) => void;
  social: SocialLink[];
  onSocialChange: (next: SocialLink[]) => void;
};

export function SettingsEditor({ event, onEventChange, social, onSocialChange }: SettingsEditorProps) {
  const set = patcher(event, onEventChange);
  const updateSocial = (id: string, patch: Partial<SocialLink>) => onSocialChange(social.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <>
      <Group title="Evento" description="Dados usados em várias partes do site: hero, contato, contagem regressiva e SEO.">
        <TextField label="Nome do evento" value={event.name} maxLength={80} onChange={(next) => set("name", next)} />
        <TextField label="Identificador (slug)" value={event.slug} maxLength={60} onChange={(next) => set("slug", next.toLowerCase())} hint="Letras minúsculas, números e hífen." />
        <Row>
          <TextField label="Data inicial" type="date" value={event.startDate} onChange={(next) => set("startDate", next)} />
          <TextField label="Data final" type="date" value={event.endDate} onChange={(next) => set("endDate", next)} />
        </Row>
        <Row>
          <TextField label="Horário" value={event.time} maxLength={40} onChange={(next) => set("time", next)} />
          <SelectField label="Fuso horário" value={event.timezone} options={TIMEZONE_OPTIONS} onChange={(next) => set("timezone", next)} />
        </Row>
        <TextField label="Local" value={event.location} maxLength={80} onChange={(next) => set("location", next)} />
        <TextField label="Endereço" value={event.address} maxLength={200} onChange={(next) => set("address", next)} />
        <Row>
          <TextField label="E-mail" type="email" value={event.email} maxLength={120} onChange={(next) => set("email", next.trim())} />
          <TextField label="Telefone" type="tel" value={event.phone} maxLength={40} onChange={(next) => set("phone", next)} />
        </Row>
        <LinkField label="Site oficial" value={event.website} onChange={(next) => set("website", next)} />
      </Group>

      <Group title="Redes sociais" description="Cadastre uma vez; header, footer e contato usam a mesma lista.">
        <SortableList
          label="Redes sociais"
          items={social}
          onReorder={onSocialChange}
          renderItem={(item) => (
            <details className="adm-item">
              <summary>
                <span data-muted={!item.active}>{SOCIAL_LABELS[item.network]}</span>
                <em>{item.url}</em>
              </summary>
              <SelectField label="Rede" value={item.network} options={NETWORK_OPTIONS} onChange={(next) => updateSocial(item.id, { network: next })} />
              <LinkField label="Link do perfil" value={item.url} onChange={(next) => updateSocial(item.id, { url: next })} />
              <Toggle label="Visível no site" checked={item.active} onChange={(next) => updateSocial(item.id, { active: next })} />
              <Toggle label="Mostrar também no header" checked={item.showInHeader} onChange={(next) => updateSocial(item.id, { showInHeader: next })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => onSocialChange(social.filter((entry) => entry.id !== item.id))}>
                Remover rede
              </button>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={social.length >= 10}
          onClick={() => onSocialChange([...social, { id: newId("s"), network: "instagram", url: "https://www.instagram.com/fecapcases/", active: true, showInHeader: false }])}
        >
          + Adicionar rede
        </button>
      </Group>
    </>
  );
}
