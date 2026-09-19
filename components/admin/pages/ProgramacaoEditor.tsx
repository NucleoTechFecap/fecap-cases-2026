"use client";

import { newId, patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { HeroFields, PageSeoFields } from "@/components/admin/pages/PageFields";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, Row, TextAreaField, TextField } from "@/components/admin/ui/Fields";
import { SortableList } from "@/components/admin/ui/SortableList";
import type { PagesConfig, ScheduleBlock, ScheduleDay } from "@/lib/landing/pages-schema";

type Programacao = PagesConfig["programacao"];
type BlockType = ScheduleBlock["type"];
type Session = Extract<ScheduleBlock, { type: "workshops" }>["sessions"][number];

const BLOCK_LABELS: Record<BlockType, string> = { workshops: "Workshops", activation: "Ativação", talk: "Palestra", break: "Intervalo" };

function newBlock(type: BlockType): ScheduleBlock {
  const base = { id: newId("bloco"), time: "00h00–00h00", title: BLOCK_LABELS[type] };

  if (type === "workshops") return { ...base, type, tag: "Salas Simultâneas", sessions: [] };
  if (type === "activation") return { ...base, type, tag: "Teatro", description: "" };
  if (type === "talk") return { ...base, type, tag: "Teatro", speaker: { name: "", role: "", bio: "", photoUrl: "" }, moderator: { name: "", role: "" } };
  return { ...base, type };
}

function BlockFields({ block, onChange }: { block: ScheduleBlock; onChange: (next: ScheduleBlock) => void }) {
  const updateSession = (id: string, patch: Partial<Session>) =>
    block.type === "workshops" && onChange({ ...block, sessions: block.sessions.map((item) => (item.id === id ? { ...item, ...patch } : item)) });

  return (
    <>
      <Row>
        <TextField label="Horário" value={block.time} maxLength={30} onChange={(time) => onChange({ ...block, time })} />
        <TextField label="Título" value={block.title} maxLength={80} onChange={(title) => onChange({ ...block, title })} />
      </Row>
      {block.type !== "break" && <TextField label="Local / etiqueta" value={block.tag} maxLength={40} onChange={(tag) => onChange({ ...block, tag })} />}

      {block.type === "activation" && (
        <TextAreaField label="Descrição" value={block.description} maxLength={400} onChange={(description) => onChange({ ...block, description })} />
      )}

      {block.type === "talk" && (
        <>
          <TextField label="Palestrante" value={block.speaker.name} maxLength={100} onChange={(name) => onChange({ ...block, speaker: { ...block.speaker, name } })} />
          <TextField label="Cargo / empresa" value={block.speaker.role} maxLength={160} onChange={(role) => onChange({ ...block, speaker: { ...block.speaker, role } })} />
          <TextAreaField label="Mini bio" value={block.speaker.bio} maxLength={400} onChange={(bio) => onChange({ ...block, speaker: { ...block.speaker, bio } })} />
          <ImageUploader
            label="Foto do palestrante"
            folder="miscellaneous"
            hint="Quadrada, de preferência. Sem foto, aparece o ícone padrão."
            value={block.speaker.photoUrl}
            onChange={(photoUrl) => onChange({ ...block, speaker: { ...block.speaker, photoUrl } })}
          />
          <Row>
            <TextField label="Mediador" value={block.moderator.name} maxLength={100} onChange={(name) => onChange({ ...block, moderator: { ...block.moderator, name } })} hint="Vazio = linha oculta." />
            <TextField label="Cargo do mediador" value={block.moderator.role} maxLength={160} onChange={(role) => onChange({ ...block, moderator: { ...block.moderator, role } })} />
          </Row>
        </>
      )}

      {block.type === "workshops" && (
        <>
          <SortableList
            label="Workshops"
            items={block.sessions}
            onReorder={(sessions) => onChange({ ...block, sessions })}
            renderItem={(session) => (
              <details className="adm-item adm-item-nested">
                <summary>
                  <strong>{session.label}</strong>
                  <span>{session.title || "Sem título"}</span>
                </summary>
                <Row>
                  <TextField label="Nome" value={session.label} maxLength={40} onChange={(label) => updateSession(session.id, { label })} />
                  <TextField label="Sala" value={session.room} maxLength={40} onChange={(room) => updateSession(session.id, { room })} />
                </Row>
                <TextField label="Título do workshop" value={session.title} maxLength={160} onChange={(title) => updateSession(session.id, { title })} />
                <TextField label="Quem conduz" value={session.speaker} maxLength={200} onChange={(speaker) => updateSession(session.id, { speaker })} />
                <button
                  type="button"
                  className="adm-btn adm-btn-small adm-btn-danger-text"
                  onClick={() => onChange({ ...block, sessions: block.sessions.filter((item) => item.id !== session.id) })}
                >
                  Excluir workshop
                </button>
              </details>
            )}
          />
          <button
            type="button"
            className="adm-btn adm-btn-add"
            disabled={block.sessions.length >= 8}
            onClick={() =>
              onChange({
                ...block,
                sessions: [...block.sessions, { id: newId("ws"), label: `Workshop ${String.fromCharCode(65 + block.sessions.length)}`, room: "", title: "", speaker: "" }],
              })
            }
          >
            + Novo workshop
          </button>
        </>
      )}
    </>
  );
}

/** Programação completa: dias (abas do site) e, dentro de cada dia, os blocos em ordem. */
export function ProgramacaoEditor({ value, onChange }: { value: Programacao; onChange: (next: Programacao) => void }) {
  const { confirm } = useFeedback();
  const set = patcher(value, onChange);
  const updateDay = (id: string, patch: Partial<ScheduleDay>) => set("days", value.days.map((day) => (day.id === id ? { ...day, ...patch } : day)));

  async function removeDay(day: ScheduleDay) {
    const confirmed = await confirm({
      title: "Excluir dia?",
      description: `"${day.label}" e os ${day.blocks.length} blocos cadastrados nele serão removidos.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (confirmed) set("days", value.days.filter((item) => item.id !== day.id));
  }

  function duplicateDay(day: ScheduleDay) {
    const copy = structuredClone(day);
    copy.id = newId("dia");
    copy.label = `${day.label} (cópia)`.slice(0, 40);
    for (const block of copy.blocks) {
      block.id = newId("bloco");
      if (block.type === "workshops") for (const session of block.sessions) session.id = newId("ws");
    }

    const index = value.days.indexOf(day);
    set("days", [...value.days.slice(0, index + 1), copy, ...value.days.slice(index + 1)]);
  }

  return (
    <>
      <HeroFields value={value.hero} onChange={(next) => set("hero", next)} />

      <Group title="Dias do evento" description='Cada dia vira uma aba no site. Use o formato "Dia 1 — 19/10": a página de Ingressos separa o nome da data pelo travessão.'>
        <SortableList
          label="Dias"
          items={value.days}
          onReorder={(next) => set("days", next)}
          renderItem={(day) => (
            <details className="adm-item">
              <summary>
                <span>{day.label || "Novo dia"}</span>
                <em className="adm-item-count">{day.blocks.length} blocos</em>
              </summary>

              <TextField label="Nome da aba" value={day.label} maxLength={40} onChange={(label) => updateDay(day.id, { label })} />

              <SortableList
                label={`Blocos de ${day.label}`}
                items={day.blocks}
                onReorder={(blocks) => updateDay(day.id, { blocks })}
                renderItem={(block) => (
                  <details className="adm-item adm-item-nested">
                    <summary>
                      <strong>{block.time}</strong>
                      <span>{block.title || BLOCK_LABELS[block.type]}</span>
                    </summary>
                    <BlockFields block={block} onChange={(next) => updateDay(day.id, { blocks: day.blocks.map((item) => (item.id === block.id ? next : item)) })} />
                    <button
                      type="button"
                      className="adm-btn adm-btn-small adm-btn-danger-text"
                      onClick={() => updateDay(day.id, { blocks: day.blocks.filter((item) => item.id !== block.id) })}
                    >
                      Excluir bloco
                    </button>
                  </details>
                )}
              />

              <div className="adm-add-row" role="group" aria-label="Adicionar bloco">
                {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => (
                  <button
                    type="button"
                    className="adm-btn adm-btn-small"
                    disabled={day.blocks.length >= 16}
                    onClick={() => updateDay(day.id, { blocks: [...day.blocks, newBlock(type)] })}
                    key={type}
                  >
                    + {BLOCK_LABELS[type]}
                  </button>
                ))}
              </div>

              <div className="adm-add-row">
                <button type="button" className="adm-btn adm-btn-small" disabled={value.days.length >= 10} onClick={() => duplicateDay(day)}>
                  Duplicar dia
                </button>
                <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" disabled={value.days.length <= 1} onClick={() => removeDay(day)}>
                  Excluir dia
                </button>
              </div>
            </details>
          )}
        />
        <button
          type="button"
          className="adm-btn adm-btn-add"
          disabled={value.days.length >= 10}
          onClick={() => set("days", [...value.days, { id: newId("dia"), label: `Dia ${value.days.length + 1} — 00/00`, blocks: [] }])}
        >
          + Novo dia
        </button>
      </Group>

      <PageSeoFields value={value.seo} onChange={(next) => set("seo", next)} />
    </>
  );
}
