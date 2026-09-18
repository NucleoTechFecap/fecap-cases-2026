"use client";

import { useState } from "react";
import { MediaLibrary, type MediaFolder } from "@/components/admin/landing/MediaLibrary";
import { useEditorContext } from "@/components/admin/landing/EditorContext";

type ImageUploaderProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: MediaFolder;
  hint?: string;
  /** Imagem original do site, oferecida em "Restaurar padrão". */
  defaultValue?: string;
};

/** O admin nunca digita caminho de arquivo: envia, escolhe na biblioteca ou remove. */
export function ImageUploader({ label, value, onChange, folder, hint, defaultValue }: ImageUploaderProps) {
  const { canEdit } = useEditorContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="adm-field">
      <span className="adm-label">{label}</span>

      <div className="adm-image">
        <div className="adm-image-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value ? <img src={value} alt="" /> : <span>Sem imagem</span>}
        </div>

        <div className="adm-image-actions">
          <button type="button" className="adm-btn adm-btn-small adm-btn-primary" disabled={!canEdit} onClick={() => setOpen(true)}>
            {value ? "Trocar imagem" : "Escolher imagem"}
          </button>
          {value && (
            <button type="button" className="adm-btn adm-btn-small" disabled={!canEdit} onClick={() => onChange("")}>
              Remover
            </button>
          )}
          {defaultValue !== undefined && value !== defaultValue && (
            <button type="button" className="adm-btn adm-btn-small" disabled={!canEdit} onClick={() => onChange(defaultValue)}>
              Restaurar padrão
            </button>
          )}
        </div>
      </div>

      {hint && <small>{hint}</small>}

      {open && (
        <div className="adm-dialog-backdrop" onClick={() => setOpen(false)}>
          <div className="adm-dialog adm-dialog-wide" role="dialog" aria-modal="true" aria-label="Biblioteca de mídia" onClick={(event) => event.stopPropagation()}>
            <header className="adm-dialog-header">
              <h2>Escolher imagem</h2>
              <button type="button" className="adm-btn adm-btn-small" onClick={() => setOpen(false)}>
                Fechar
              </button>
            </header>
            <MediaLibrary
              canEdit={canEdit}
              folder={folder}
              onSelect={(asset) => {
                onChange(asset.url);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
