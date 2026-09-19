"use client";

import type { PostForm, SetField } from "@/components/admin/blog/form";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { Group, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";

/** SEO da publicação. Tudo é opcional: vazio = usa título, resumo e imagem de capa. */
export function BlogSeoEditor({ form, set }: { form: PostForm; set: SetField }) {
  const title = form.seoTitle || form.title || "Título da publicação";
  const description = form.seoDescription || form.excerpt || "O resumo da publicação aparece aqui.";
  const shareImage = form.ogImageUrl || form.coverImageUrl;

  return (
    <Group title="SEO" description="Campos vazios usam o título, o resumo e a imagem de capa.">
      <TextField label="Título para buscadores (SEO Title)" value={form.seoTitle} maxLength={70} onChange={(next) => set("seoTitle", next)} hint="Ideal: até 60 caracteres." />
      <TextAreaField label="Meta description" rows={3} value={form.seoDescription} maxLength={200} onChange={(next) => set("seoDescription", next)} hint="Ideal: entre 120 e 160 caracteres." />
      <TextField label="URL canônica" type="url" value={form.canonicalUrl} maxLength={300} placeholder="https://…" onChange={(next) => set("canonicalUrl", next.trim())} hint="Só preencha se o conteúdo original estiver em outro endereço." />
      <Toggle label="Permitir indexação (index)" hint="Desligado: a página recebe noindex e sai do sitemap." checked={form.seoIndex} onChange={(next) => set("seoIndex", next)} />

      <div className="adm-seo-google" aria-label="Prévia aproximada no Google">
        <small>fecapcases › blog › {form.slug || "slug-da-publicacao"}</small>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <TextField label="Título ao compartilhar (OG Title)" value={form.ogTitle} maxLength={100} onChange={(next) => set("ogTitle", next)} />
      <TextAreaField label="Descrição ao compartilhar (OG Description)" rows={2} value={form.ogDescription} maxLength={200} onChange={(next) => set("ogDescription", next)} />
      <ImageUploader label="Imagem de compartilhamento (OG Image)" folder="og" value={form.ogImageUrl} onChange={(next) => set("ogImageUrl", next)} hint="Recomendado: 1200 × 630 px. Vazio: usa a capa." />

      <div className="adm-share-preview" aria-label="Prévia aproximada do compartilhamento (Open Graph)">
        <div className="adm-share-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {shareImage ? <img src={shareImage} alt="" /> : <span>Sem imagem</span>}
        </div>
        <div className="adm-share-text">
          <small>FECAP Cases</small>
          <strong>{form.ogTitle || title}</strong>
          <p>{form.ogDescription || description}</p>
        </div>
      </div>
    </Group>
  );
}
