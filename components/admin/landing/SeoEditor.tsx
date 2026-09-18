"use client";

import { patcher } from "@/components/admin/landing/helpers";
import { ImageUploader } from "@/components/admin/landing/ImageUploader";
import { Group, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import type { SeoConfig } from "@/lib/landing/schema";

export function SeoEditor({ value, onChange, siteName }: { value: SeoConfig; onChange: (next: SeoConfig) => void; siteName: string }) {
  const set = patcher(value, onChange);
  const shareTitle = value.ogTitle || value.title || siteName;
  const shareDescription = value.ogDescription || value.description;

  return (
    <>
      <Group title="Busca (Google)">
        <TextField label="Título da página" value={value.title} maxLength={70} onChange={(next) => set("title", next)} hint="Ideal: até 60 caracteres." />
        <TextAreaField label="Descrição" value={value.description} maxLength={200} onChange={(next) => set("description", next)} hint="Ideal: entre 120 e 160 caracteres." />
        <TextField label="Palavras-chave" value={value.keywords} maxLength={300} onChange={(next) => set("keywords", next)} hint="Separe por vírgula." />
        <TextField label="Endereço oficial do site (canonical)" type="url" value={value.canonicalUrl} maxLength={300} placeholder="https://…" onChange={(next) => set("canonicalUrl", next.trim())} hint="Precisa começar com https://" />
        <Toggle label="Permitir que buscadores indexem a página" checked={value.index} onChange={(next) => set("index", next)} />
        <Toggle label="Permitir que buscadores sigam os links" checked={value.follow} onChange={(next) => set("follow", next)} />
      </Group>

      <Group title="Compartilhamento (WhatsApp, LinkedIn, X…)">
        <TextField label="Título ao compartilhar" value={value.ogTitle} maxLength={90} onChange={(next) => set("ogTitle", next)} hint="Em branco: usa o título da página." />
        <TextAreaField label="Descrição ao compartilhar" rows={2} value={value.ogDescription} maxLength={200} onChange={(next) => set("ogDescription", next)} />
        <ImageUploader label="Imagem de compartilhamento" folder="og" value={value.ogImage} onChange={(next) => set("ogImage", next)} hint="Recomendado: 1200 × 630 px." />
        <ImageUploader label="Imagem para X/Twitter (opcional)" folder="og" value={value.twitterImage} onChange={(next) => set("twitterImage", next)} />

        <div className="adm-share-preview" aria-label="Prévia aproximada do compartilhamento">
          <div className="adm-share-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {value.ogImage ? <img src={value.ogImage} alt="" /> : <span>Sem imagem</span>}
          </div>
          <div className="adm-share-text">
            <small>{siteName}</small>
            <strong>{shareTitle}</strong>
            <p>{shareDescription}</p>
          </div>
        </div>
      </Group>
    </>
  );
}
