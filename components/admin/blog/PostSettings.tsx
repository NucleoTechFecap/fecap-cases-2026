"use client";

import type { PostForm, SetField } from "@/components/admin/blog/form";
import { StatusBadge } from "@/components/admin/blog/StatusBadge";
import { TagPicker } from "@/components/admin/blog/TagPicker";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { Field, Group, Row, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { BLOG_TIMEZONE_LABEL, type BlogCategory, type BlogTag, type PostStatus, formatShortDate } from "@/lib/blog/types";

export type PublishMode = "now" | "schedule";
export type Schedule = { mode: PublishMode; date: string; time: string };

type PostSettingsProps = {
  form: PostForm;
  set: SetField;
  savedStatus: PostStatus;
  schedule: Schedule;
  onScheduleChange: (next: Schedule) => void;
  categories: BlogCategory[];
  tags: BlogTag[];
  onTagCreated: (tag: BlogTag) => void;
  canEdit: boolean;
  canPublish: boolean;
  onArchive?: () => void;
};

export function PostSettings({ form, set, savedStatus, schedule, onScheduleChange, categories, tags, onTagCreated, canEdit, canPublish, onArchive }: PostSettingsProps) {
  return (
    <>
      <Group title="Publicação">
        <div className="adm-blog-statusline">
          <span>Status</span>
          <StatusBadge status={savedStatus} />
        </div>

        {!canPublish && <p className="adm-note">Seu perfil edita rascunhos. Publicar, agendar e arquivar é feito por um administrador.</p>}

        <div className="adm-segmented" role="group" aria-label="Quando publicar">
          <button type="button" aria-pressed={schedule.mode === "now"} disabled={!canPublish} onClick={() => onScheduleChange({ ...schedule, mode: "now" })}>
            Publicar agora
          </button>
          <button type="button" aria-pressed={schedule.mode === "schedule"} disabled={!canPublish} onClick={() => onScheduleChange({ ...schedule, mode: "schedule" })}>
            Agendar
          </button>
        </div>

        {schedule.mode === "schedule" ? (
          <>
            <Row>
              <TextField label="Data" type="date" value={schedule.date} onChange={(date) => onScheduleChange({ ...schedule, date })} />
              <TextField label="Hora" type="time" value={schedule.time} onChange={(time) => onScheduleChange({ ...schedule, time })} />
            </Row>
            <small className="adm-blog-hint">{BLOG_TIMEZONE_LABEL}. A publicação entra no ar sozinha no horário definido.</small>
          </>
        ) : (
          form.publishedAt && <small className="adm-blog-hint">Data de publicação: {formatShortDate(form.publishedAt)} (mantida ao atualizar).</small>
        )}

        <Toggle label="Destacar publicação" hint="Aparece em “Destaques” no topo do /blog." checked={form.isFeatured} onChange={(next) => set("isFeatured", next)} />

        {onArchive && canPublish && savedStatus !== "archived" && (
          <button type="button" className="adm-btn adm-btn-small" onClick={onArchive}>
            Arquivar publicação
          </button>
        )}
      </Group>

      <Group title="Categoria e tags">
        <Field label="Categoria" htmlFor="blog-category">
          <select id="blog-category" className="adm-input" value={form.categoryId ?? ""} onChange={(event) => set("categoryId", event.target.value || null)}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
                {category.isActive ? "" : " (inativa)"}
              </option>
            ))}
          </select>
          <small>
            <a href="/admin/blog/categories" target="_blank" rel="noopener noreferrer">
              Gerenciar categorias ↗
            </a>
          </small>
        </Field>

        <TagPicker allTags={tags} selected={form.tagIds} onChange={(next) => set("tagIds", next)} onTagCreated={onTagCreated} disabled={!canEdit} />
      </Group>

      <Group title="Autor" description="Assinatura exibida no artigo.">
        <TextField label="Nome" value={form.authorName} maxLength={120} onChange={(next) => set("authorName", next)} />
        <TextField label="Cargo / função" value={form.authorRole} maxLength={120} onChange={(next) => set("authorRole", next)} />
        <TextAreaField label="Bio (opcional)" rows={3} value={form.authorBio} maxLength={400} onChange={(next) => set("authorBio", next)} />
        <ImageUploader label="Foto" folder="blog-content" value={form.authorAvatarUrl} onChange={(next) => set("authorAvatarUrl", next)} hint="Imagem quadrada, exibida em círculo." />
      </Group>
    </>
  );
}
