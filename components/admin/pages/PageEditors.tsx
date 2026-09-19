"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { LinkField } from "@/components/admin/landing/LinkField";
import { CardListEditor, HeadingFields, HeroFields, LineListEditor, PageButtonFields, PageSeoFields } from "@/components/admin/pages/PageFields";
import { Group, Row, SelectField, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { PagesConfig } from "@/lib/landing/pages-schema";

type EditorProps<T> = { value: T; onChange: (next: T) => void };

// ---------- Sobre ----------
type Sobre = PagesConfig["sobre"];

export function SobreEditor({ value, onChange }: EditorProps<Sobre>) {
  const set = patcher(value, onChange);
  const updateStat = (id: string, patch: Partial<Sobre["stats"][number]>) => set("stats", value.stats.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const updateStep = (id: string, patch: Partial<Sobre["flow"][number]>) => set("flow", value.flow.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />
      <PageButtonFields title="Botão principal do topo" value={value.primaryButton} onChange={(next) => set("primaryButton", next)} />
      <PageButtonFields title="Botão secundário do topo" value={value.secondaryButton} onChange={(next) => set("secondaryButton", next)} />

      <Group title="O evento" description="Texto de apresentação, logo abaixo do topo.">
        <HeadingFields value={value.introHeading} onChange={(next) => set("introHeading", next)} />
        <LineListEditor label="Parágrafo" addLabel="Novo parágrafo" idPrefix="intro" rows={4} max={6} maxLength={700} value={value.intro} onChange={(next) => set("intro", next)} />
      </Group>

      <Group title="Números do evento" description="Faixa com os números em destaque. Sem itens, a faixa não aparece.">
        <SortableList
          label="Números"
          items={value.stats}
          onReorder={(next) => set("stats", next)}
          renderItem={(item) => (
            <details className="adm-item">
              <summary>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </summary>
              <Row>
                <TextField label="Número" value={item.value} maxLength={8} onChange={(next) => updateStat(item.id, { value: next })} />
                <TextField label="Legenda" value={item.label} maxLength={40} onChange={(next) => updateStat(item.id, { label: next })} />
              </Row>
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("stats", value.stats.filter((entry) => entry.id !== item.id))}>
                Excluir
              </button>
            </details>
          )}
        />
        <button type="button" className="adm-btn adm-btn-add" disabled={value.stats.length >= 6} onClick={() => set("stats", [...value.stats, { id: newId("stat"), value: "0", label: "Nova legenda" }])}>
          + Novo número
        </button>
      </Group>

      <Group title="Pilares" description="Bloco azul com os cartões numerados. Sem cartões, o bloco não aparece.">
        <HeadingFields value={value.pillarsHeading} onChange={(next) => set("pillarsHeading", next)} />
        <CardListEditor label="Pilares" addLabel="Novo pilar" idPrefix="pillar" tagLabel="Número / etiqueta" max={12} value={value.pillars} onChange={(next) => set("pillars", next)} />
      </Group>

      <Group title="Roteiro de cada noite" description="Linha do tempo com os horários. Sem etapas, o bloco não aparece.">
        <HeadingFields value={value.flowHeading} onChange={(next) => set("flowHeading", next)} />
        <SortableList
          label="Etapas"
          items={value.flow}
          onReorder={(next) => set("flow", next)}
          renderItem={(item) => (
            <details className="adm-item">
              <summary>
                <strong>{item.time}</strong>
                <span>{item.title || "Sem título"}</span>
              </summary>
              <Row>
                <TextField label="Horário" value={item.time} maxLength={20} onChange={(next) => updateStep(item.id, { time: next })} />
                <TextField label="Título" value={item.title} maxLength={80} onChange={(next) => updateStep(item.id, { title: next })} />
              </Row>
              <TextAreaField label="Texto" value={item.text} maxLength={300} onChange={(next) => updateStep(item.id, { text: next })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("flow", value.flow.filter((entry) => entry.id !== item.id))}>
                Excluir
              </button>
            </details>
          )}
        />
        <button type="button" className="adm-btn adm-btn-add" disabled={value.flow.length >= 12} onClick={() => set("flow", [...value.flow, { id: newId("flow"), time: "00h00", title: "Nova etapa", text: "" }])}>
          + Nova etapa
        </button>
      </Group>

      <Group title="Quem faz" description="Bloco laranja no fim da página. Sem cartões, o bloco não aparece.">
        <HeadingFields value={value.teamHeading} onChange={(next) => set("teamHeading", next)} />
        <CardListEditor label="Cartões" addLabel="Novo cartão" idPrefix="team" max={9} value={value.team} onChange={(next) => set("team", next)} />
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Patrocinadores ----------
type Patrocinadores = PagesConfig["patrocinadores"];
type Tier = Patrocinadores["tiers"][number];

const TONE_OPTIONS = [
  { value: "orange", label: "Laranja" },
  { value: "blue", label: "Azul" },
  { value: "cyan", label: "Azul claro" },
] as const;

export function PatrocinadoresEditor({ value, onChange }: EditorProps<Patrocinadores>) {
  const set = patcher(value, onChange);
  const updateTier = (id: string, patch: Partial<Tier>) => set("tiers", value.tiers.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <>
      <p className="adm-intro">As marcas, os logos e a imagem da faixa são os mesmos da landing: edite em Conteúdo › Patrocinadores, apoiadores e parceiros.</p>

      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />
      <PageButtonFields title="Botão do topo" value={value.button} onChange={(next) => set("button", next)} />

      <Group title="Por que apoiar" description="Bloco azul com os motivos. Sem cartões, o bloco não aparece.">
        <HeadingFields value={value.benefitsHeading} onChange={(next) => set("benefitsHeading", next)} />
        <CardListEditor label="Motivos" addLabel="Novo motivo" idPrefix="benefit" tagLabel="Etiqueta" max={8} value={value.benefits} onChange={(next) => set("benefits", next)} />
      </Group>

      <Group title="Cotas" description="Cartões com as formas de participar. Sem cotas, o bloco não aparece.">
        <HeadingFields value={value.tiersHeading} onChange={(next) => set("tiersHeading", next)} />
        <SortableList
          label="Cotas"
          items={value.tiers}
          onReorder={(next) => set("tiers", next)}
          renderItem={(tier) => (
            <details className="adm-item">
              <summary>
                <span>{tier.name || "Nova cota"}</span>
              </summary>
              <Row>
                <TextField label="Nome" value={tier.name} maxLength={40} onChange={(next) => updateTier(tier.id, { name: next })} />
                <SelectField label="Cor" value={tier.tone} options={TONE_OPTIONS} onChange={(next) => updateTier(tier.id, { tone: next })} />
              </Row>
              <TextAreaField label="Resumo" rows={2} value={tier.summary} maxLength={200} onChange={(next) => updateTier(tier.id, { summary: next })} />
              <LineListEditor label="Contrapartida" addLabel="Nova contrapartida" idPrefix="perk" max={10} maxLength={300} value={tier.perks} onChange={(next) => updateTier(tier.id, { perks: next })} />
              <PageButtonFields title="Botão da cota" value={tier.button} onChange={(next) => updateTier(tier.id, { button: next })} />
              <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => set("tiers", value.tiers.filter((entry) => entry.id !== tier.id))}>
                Excluir cota
              </button>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.tiers.length >= 6}
          onClick={() =>
            set("tiers", [
              ...value.tiers,
              { id: newId("tier"), name: "Nova cota", tone: "orange", summary: "", perks: [], button: { enabled: true, label: "Falar com a organização", url: "/contato", newTab: false } },
            ])
          }
        >
          + Nova cota
        </button>
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Ingressos ----------
export function IngressosEditor({ value, onChange }: EditorProps<PagesConfig["ingressos"]>) {
  const set = patcher(value, onChange);

  return (
    <>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Inscrição" description="O link abaixo é usado em todos os botões de inscrição desta página.">
        <LinkField label="Link de inscrição (Sympla)" value={value.ticketsUrl} onChange={(next) => set("ticketsUrl", next)} />
        <TextField label="Texto do botão do topo" value={value.heroButtonLabel} maxLength={60} onChange={(next) => set("heroButtonLabel", next)} hint="Vazio = sem botão no topo." />
      </Group>

      <Group title="Passo a passo" description="Sem passos, o bloco não aparece.">
        <HeadingFields value={value.stepsHeading} onChange={(next) => set("stepsHeading", next)} />
        <CardListEditor label="Passos" addLabel="Novo passo" idPrefix="step" tagLabel="Número" max={6} value={value.steps} onChange={(next) => set("steps", next)} />
      </Group>

      <Group title="Ingressos por noite" description="Um cartão para cada dia cadastrado em Páginas › Programação.">
        <HeadingFields value={value.nightsHeading} onChange={(next) => set("nightsHeading", next)} />
        <TextField label="Horário exibido" value={value.nightTime} maxLength={40} onChange={(next) => set("nightTime", next)} hint="Vazio = horário definido em Configurações do evento." />
        <Row>
          <TextField label="Selo" value={value.nightBadge} maxLength={30} onChange={(next) => set("nightBadge", next)} />
          <TextField label="Texto do botão" value={value.nightButtonLabel} maxLength={40} onChange={(next) => set("nightButtonLabel", next)} />
        </Row>
        <TextField label="Link para a programação" value={value.nightLinkLabel} maxLength={60} onChange={(next) => set("nightLinkLabel", next)} hint="O número do dia é acrescentado no fim. Vazio = sem link." />
      </Group>

      <Group title="Bom saber">
        <HeadingFields value={value.notesHeading} onChange={(next) => set("notesHeading", next)} />
        <LineListEditor label="Aviso" addLabel="Novo aviso" idPrefix="note" max={12} maxLength={300} value={value.notes} onChange={(next) => set("notes", next)} />
        <Toggle label="Mostrar a linha final com links para Dúvidas e Contato" checked={value.showHelpNote} onChange={(next) => set("showHelpNote", next)} />
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Dúvidas ----------
export function DuvidasEditor({ value, onChange }: EditorProps<PagesConfig["duvidas"]>) {
  const set = patcher(value, onChange);

  return (
    <>
      <p className="adm-intro">As perguntas e respostas são as mesmas da landing: edite em Conteúdo › FAQ.</p>

      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Cabeçalho das perguntas">
        <HeadingFields value={value.heading} onChange={(next) => set("heading", next)} />
      </Group>

      <Group title="Cartão de ajuda" description="O e-mail exibido é o das Configurações do evento.">
        <TextField label="Título" value={value.helpTitle} maxLength={80} onChange={(next) => set("helpTitle", next)} />
        <TextAreaField label="Texto" rows={2} value={value.helpText} maxLength={200} onChange={(next) => set("helpText", next)} />
      </Group>
      <PageButtonFields title="Botão do cartão de ajuda" value={value.helpButton} onChange={(next) => set("helpButton", next)} />

      <Group title="Busca">
        <TextField label="Rótulo do campo" value={value.searchLabel} maxLength={40} onChange={(next) => set("searchLabel", next)} />
        <TextField label="Exemplo dentro do campo" value={value.searchPlaceholder} maxLength={80} onChange={(next) => set("searchPlaceholder", next)} />
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Contato ----------
export function ContatoEditor({ value, onChange }: EditorProps<PagesConfig["contato"]>) {
  const set = patcher(value, onChange);

  return (
    <>
      <p className="adm-intro">
        E-mail, telefone e endereço vêm de Configurações; o formulário e o mapa, de Conteúdo › Contato; as redes sociais, de Configurações › Redes sociais.
      </p>

      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Canais oficiais">
        <HeadingFields value={value.heading} onChange={(next) => set("heading", next)} />
        <TextField label="Título do cartão de e-mail" value={value.emailLabel} maxLength={30} onChange={(next) => set("emailLabel", next)} />
        <TextField label="Título do cartão de telefone" value={value.phoneLabel} maxLength={30} onChange={(next) => set("phoneLabel", next)} />
        <TextField label="Título do cartão de endereço" value={value.addressLabel} maxLength={30} onChange={(next) => set("addressLabel", next)} />
        <TextField label="Título da faixa de redes sociais" value={value.socialTitle} maxLength={60} onChange={(next) => set("socialTitle", next)} />
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Blog ----------
export function BlogPageEditor({ value, onChange }: EditorProps<PagesConfig["blog"]>) {
  const set = patcher(value, onChange);

  return (
    <>
      <p className="adm-intro">As publicações, categorias e tags são gerenciadas no menu Publicações. Aqui você edita o topo da página do Blog.</p>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />
      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}

// ---------- Chamada final ----------
export function CtaEditor({ value, onChange }: EditorProps<PagesConfig["cta"]>) {
  const set = patcher(value, onChange);

  return (
    <>
      <p className="adm-intro">Faixa exibida no fim das páginas internas. O local e as datas vêm de Configurações do evento.</p>
      <Group title="Texto">
        <TextField label="Frase em destaque" value={value.highlight} maxLength={60} onChange={(next) => set("highlight", next)} />
      </Group>
      <PageButtonFields title="Botão principal" value={value.primaryButton} onChange={(next) => set("primaryButton", next)} />
      <PageButtonFields title="Botão secundário" value={value.secondaryButton} onChange={(next) => set("secondaryButton", next)} />
    </>
  );
}
