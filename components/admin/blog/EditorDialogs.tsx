"use client";

import { useState } from "react";
import { useEditorContext } from "@/components/admin/landing/EditorContext";
import { LinkField } from "@/components/admin/landing/LinkField";
import { MediaLibrary } from "@/components/admin/landing/MediaLibrary";
import { SelectField, TextAreaField, TextField, Toggle } from "@/components/admin/ui/Fields";
import { Modal } from "@/components/admin/ui/Modal";
import { IMAGE_ALIGNMENTS, type ImageAlignment } from "@/lib/blog/content";
import { isSafeUrl } from "@/lib/landing/urls";

export type LinkValues = { text: string; href: string; newTab: boolean };
export type ImageValues = { src: string; alt: string; decorative: boolean; caption: string; credit: string; sourceUrl: string; align: ImageAlignment };
export type CtaValues = { label: string; href: string; newTab: boolean; style: "filled" | "outline" };

function DialogActions({ onCancel, onRemove, removeLabel, submitLabel, disabled }: { onCancel: () => void; onRemove?: () => void; removeLabel?: string; submitLabel: string; disabled?: boolean }) {
  return (
    <div className="adm-dialog-actions">
      {onRemove && (
        <button type="button" className="adm-btn adm-btn-danger-text adm-dialog-remove" onClick={onRemove}>
          {removeLabel}
        </button>
      )}
      <button type="button" className="adm-btn" onClick={onCancel}>
        Cancelar
      </button>
      <button type="submit" className="adm-btn adm-btn-primary" disabled={disabled}>
        {submitLabel}
      </button>
    </div>
  );
}

export function LinkDialog({ initial, isEditing, onSubmit, onRemove, onClose }: { initial: LinkValues; isEditing: boolean; onSubmit: (values: LinkValues) => void; onRemove: () => void; onClose: () => void }) {
  const [values, setValues] = useState(initial);
  const valid = values.href.trim() !== "" && isSafeUrl(values.href);

  return (
    <Modal title={isEditing ? "Editar link" : "Adicionar link"} onClose={onClose}>
      <form
        className="adm-dialog-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onSubmit({ ...values, href: values.href.trim() });
        }}
      >
        <TextField label="Texto" value={values.text} maxLength={300} onChange={(text) => setValues({ ...values, text })} hint="Em branco: usa o próprio endereço." />
        <LinkField label="URL" value={values.href} onChange={(href) => setValues({ ...values, href })} />
        <Toggle label="Abrir em nova aba" hint="Links externos sempre abrem em nova aba no site." checked={values.newTab} onChange={(newTab) => setValues({ ...values, newTab })} />
        <DialogActions onCancel={onClose} onRemove={isEditing ? onRemove : undefined} removeLabel="Remover link" submitLabel={isEditing ? "Salvar link" : "Adicionar link"} disabled={!valid} />
      </form>
    </Modal>
  );
}

export function ImageDialog({ initial, onSubmit, onRemove, onClose }: { initial: ImageValues | null; onSubmit: (values: ImageValues) => void; onRemove?: () => void; onClose: () => void }) {
  const { canEdit } = useEditorContext();
  const [values, setValues] = useState<ImageValues>(initial ?? { src: "", alt: "", decorative: false, caption: "", credit: "", sourceUrl: "", align: "center" });
  const [picking, setPicking] = useState(initial === null);
  const valid = values.src !== "" && (values.decorative || values.alt.trim() !== "") && isSafeUrl(values.sourceUrl);

  if (picking) {
    return (
      <Modal title="Adicionar imagem" onClose={values.src ? () => setPicking(false) : onClose} wide>
        <p className="adm-note">Envie uma imagem nova ou selecione uma da biblioteca.</p>
        <MediaLibrary
          canEdit={canEdit}
          folder="blog-content"
          onSelect={(asset) => {
            setValues((current) => ({ ...current, src: asset.url }));
            setPicking(false);
          }}
        />
      </Modal>
    );
  }

  return (
    <Modal title="Imagem do conteúdo" onClose={onClose}>
      <form
        className="adm-dialog-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onSubmit({ ...values, alt: values.decorative ? "" : values.alt.trim() });
        }}
      >
        <div className="adm-image">
          <div className="adm-image-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={values.src} alt="" />
          </div>
          <div className="adm-image-actions">
            <button type="button" className="adm-btn adm-btn-small" onClick={() => setPicking(true)}>
              Trocar imagem
            </button>
          </div>
        </div>

        {!values.decorative && (
          <TextField label="Texto alternativo (obrigatório)" value={values.alt} maxLength={200} onChange={(alt) => setValues({ ...values, alt })} hint="Descreva a imagem para quem usa leitor de tela." />
        )}
        <Toggle label="Imagem decorativa" hint="Marque apenas se a imagem não acrescenta informação." checked={values.decorative} onChange={(decorative) => setValues({ ...values, decorative })} />
        <TextAreaField label="Legenda" rows={2} value={values.caption} maxLength={300} onChange={(caption) => setValues({ ...values, caption })} />
        <TextField label="Crédito" value={values.credit} maxLength={120} onChange={(credit) => setValues({ ...values, credit })} />
        <LinkField label="Link da fonte" value={values.sourceUrl} onChange={(sourceUrl) => setValues({ ...values, sourceUrl })} />
        <SelectField label="Alinhamento" value={values.align} options={IMAGE_ALIGNMENTS} onChange={(align) => setValues({ ...values, align })} />
        <DialogActions onCancel={onClose} onRemove={onRemove} removeLabel="Remover imagem" submitLabel={initial ? "Salvar imagem" : "Inserir imagem"} disabled={!valid} />
      </form>
    </Modal>
  );
}

const CTA_STYLES = [
  { value: "filled", label: "Preenchido" },
  { value: "outline", label: "Contorno" },
] as const;

export function CtaDialog({ initial, onSubmit, onRemove, onClose }: { initial: CtaValues | null; onSubmit: (values: CtaValues) => void; onRemove?: () => void; onClose: () => void }) {
  const [values, setValues] = useState<CtaValues>(initial ?? { label: "", href: "", newTab: false, style: "filled" });
  const valid = values.label.trim() !== "" && values.href.trim() !== "" && isSafeUrl(values.href);

  return (
    <Modal title={initial ? "Editar botão (CTA)" : "Adicionar botão (CTA)"} onClose={onClose}>
      <form
        className="adm-dialog-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onSubmit({ ...values, label: values.label.trim(), href: values.href.trim() });
        }}
      >
        <TextField label="Texto do botão" value={values.label} maxLength={60} placeholder="Garanta seu ingresso" onChange={(label) => setValues({ ...values, label })} />
        <LinkField label="Destino" value={values.href} onChange={(href) => setValues({ ...values, href })} />
        <SelectField label="Estilo" value={values.style} options={CTA_STYLES} onChange={(style) => setValues({ ...values, style })} />
        <Toggle label="Abrir em nova aba" checked={values.newTab} onChange={(newTab) => setValues({ ...values, newTab })} />
        <DialogActions onCancel={onClose} onRemove={onRemove} removeLabel="Remover botão" submitLabel={initial ? "Salvar botão" : "Inserir botão"} disabled={!valid} />
      </form>
    </Modal>
  );
}
