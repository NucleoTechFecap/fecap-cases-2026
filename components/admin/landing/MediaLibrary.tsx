"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type MediaAsset, deleteAsset, listAssets, renameAsset, uploadAsset } from "@/app/admin/actions";
import { formatBytes, formatDateTime } from "@/components/admin/landing/helpers";
import { useFeedback } from "@/components/admin/ui/Feedback";

export const MEDIA_FOLDERS = [
  { value: "hero", label: "Hero" },
  { value: "sponsors", label: "Patrocinadores" },
  { value: "partners", label: "Parceiros" },
  { value: "gallery", label: "Galeria" },
  { value: "footer", label: "Footer" },
  { value: "og", label: "Compartilhamento (SEO)" },
  { value: "blog-covers", label: "Blog · Capas" },
  { value: "blog-content", label: "Blog · Conteúdo" },
  { value: "miscellaneous", label: "Outros" },
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number]["value"];

type MediaLibraryProps = {
  canEdit: boolean;
  folder?: MediaFolder;
  /** Quando informado, a biblioteca funciona como seletor de imagem. */
  onSelect?: (asset: MediaAsset) => void;
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,.svg";
const MAX_SIZE = 5 * 1024 * 1024;

export function MediaLibrary({ canEdit, folder = "miscellaneous", onSelect }: MediaLibraryProps) {
  const { toast, confirm } = useFeedback();
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [uploadFolder, setUploadFolder] = useState<MediaFolder>(folder);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const result = await listAssets();
    if (result.ok) setAssets(result.data);
    else {
      setAssets([]);
      toast(result.error, "error");
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(file: File | undefined) {
    if (!file || uploading) return;
    // Validação rápida no navegador; a validação de verdade acontece no servidor.
    if (file.size > MAX_SIZE) return toast("A imagem deve ter no máximo 5 MB.", "error");

    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", uploadFolder);

    const result = await uploadAsset(formData);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";

    if (!result.ok) return toast(result.error, "error");
    setAssets((current) => [result.data, ...(current ?? [])]);
    toast("Imagem enviada.");
    onSelect?.(result.data);
  }

  async function handleRename(asset: MediaAsset, name: string) {
    setRenaming(null);
    if (name.trim() === "" || name.trim() === asset.name) return;

    setBusyId(asset.id);
    const result = await renameAsset(asset.id, name);
    setBusyId(null);

    if (!result.ok) return toast(result.error, "error");
    setAssets((current) => (current ?? []).map((item) => (item.id === asset.id ? result.data : item)));
    toast("Imagem renomeada.");
  }

  async function handleDelete(asset: MediaAsset) {
    const confirmed = await confirm({
      title: "Excluir imagem?",
      description: `"${asset.name}" será removida da biblioteca. Imagens em uso na landing não podem ser excluídas.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;

    setBusyId(asset.id);
    const result = await deleteAsset(asset.id);
    setBusyId(null);

    if (!result.ok) return toast(result.error, "error");
    setAssets((current) => (current ?? []).filter((item) => item.id !== asset.id));
    toast("Imagem excluída.");
  }

  async function handleCopy(asset: MediaAsset) {
    try {
      await navigator.clipboard.writeText(asset.url);
      toast("Link da imagem copiado.");
    } catch {
      toast("Não foi possível copiar o link.", "error");
    }
  }

  return (
    <div className="adm-media">
      {canEdit && (
        <div className="adm-media-upload">
          <select
            className="adm-input"
            aria-label="Pasta de destino"
            value={uploadFolder}
            onChange={(event) => setUploadFolder(event.target.value as MediaFolder)}
          >
            {MEDIA_FOLDERS.map((item) => (
              <option value={item.value} key={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <input ref={fileInput} type="file" accept={ACCEPT} hidden onChange={(event) => handleUpload(event.target.files?.[0])} />
          <button type="button" className="adm-btn adm-btn-primary" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? "Enviando…" : "Enviar imagem"}
          </button>
          <small>JPG, PNG, WEBP ou SVG · até 5 MB</small>
        </div>
      )}

      {assets === null ? (
        <p className="adm-empty">Carregando biblioteca…</p>
      ) : assets.length === 0 ? (
        <p className="adm-empty">Nenhuma imagem enviada ainda.</p>
      ) : (
        <ul className="adm-media-grid">
          {assets.map((asset) => (
            <li className="adm-media-card" key={asset.id} data-busy={busyId === asset.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="" loading="lazy" />
              <div className="adm-media-info">
                {renaming?.id === asset.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleRename(asset, renaming.name);
                    }}
                  >
                    <input
                      className="adm-input"
                      aria-label="Novo nome da imagem"
                      autoFocus
                      maxLength={120}
                      value={renaming.name}
                      onChange={(event) => setRenaming({ id: asset.id, name: event.target.value })}
                      onBlur={() => void handleRename(asset, renaming.name)}
                    />
                  </form>
                ) : (
                  <strong title={asset.name}>{asset.name}</strong>
                )}
                <span>
                  {asset.mimeType.replace("image/", "").replace("+xml", "").toUpperCase()} · {formatBytes(asset.size)}
                </span>
                <span>{formatDateTime(asset.createdAt)}</span>
              </div>
              <div className="adm-media-actions">
                {onSelect && (
                  <button type="button" className="adm-btn adm-btn-primary adm-btn-small" onClick={() => onSelect(asset)}>
                    Selecionar
                  </button>
                )}
                <button type="button" className="adm-btn adm-btn-small" onClick={() => handleCopy(asset)}>
                  Copiar link
                </button>
                {canEdit && (
                  <>
                    <button type="button" className="adm-btn adm-btn-small" onClick={() => setRenaming({ id: asset.id, name: asset.name })}>
                      Renomear
                    </button>
                    <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => handleDelete(asset)}>
                      Excluir
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
