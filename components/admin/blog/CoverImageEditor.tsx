"use client";

import type { PostForm, SetField } from "@/components/admin/blog/form";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { LinkField } from "@/components/admin/landing/LinkField";
import { Group, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";

export function CoverImageEditor({ form, set }: { form: PostForm; set: SetField }) {
  const needsAlt = form.coverImageUrl !== "" && !form.coverImageDecorative && form.coverImageAlt.trim() === "";

  return (
    <Group title="Imagem de capa" description="Aparece no topo do artigo, nos cards e no compartilhamento.">
      <ImageUploader label="Imagem" folder="blog-covers" value={form.coverImageUrl} onChange={(next) => set("coverImageUrl", next)} hint="Recomendado: 1600 × 900 px (16:9). JPG, PNG ou WEBP até 5 MB." />

      {form.coverImageUrl && (
        <>
          {!form.coverImageDecorative && (
            <TextField label="Texto alternativo (Alt)" value={form.coverImageAlt} maxLength={200} placeholder="Campus da FECAP durante evento" onChange={(next) => set("coverImageAlt", next)} />
          )}
          {needsAlt && <small className="adm-error">Obrigatório para publicar: descreva a imagem ou marque como decorativa.</small>}
          <Toggle label="Imagem decorativa" hint="Sem informação relevante para leitores de tela." checked={form.coverImageDecorative} onChange={(next) => set("coverImageDecorative", next)} />
          <TextAreaField label="Legenda" rows={2} value={form.coverImageCaption} maxLength={300} onChange={(next) => set("coverImageCaption", next)} />
          <TextField label="Crédito da imagem" value={form.coverImageCredit} maxLength={120} placeholder="FECAP" onChange={(next) => set("coverImageCredit", next)} />
          <LinkField label="Link da fonte" value={form.coverImageSourceUrl} onChange={(next) => set("coverImageSourceUrl", next)} />
        </>
      )}
    </Group>
  );
}
