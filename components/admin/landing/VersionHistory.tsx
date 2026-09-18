"use client";

import { useCallback, useEffect, useState } from "react";
import { type VersionSummary, listVersions } from "@/app/admin/actions";
import { useEditorContext } from "@/components/admin/landing/EditorContext";
import { formatDateTime } from "@/components/admin/landing/helpers";
import { useFeedback } from "@/components/admin/ui/Feedback";

type VersionHistoryProps = {
  /** Muda quando há nova publicação, para recarregar a lista. */
  refreshKey: number;
  viewingId: string | null;
  onView: (version: VersionSummary) => void;
  onRestore: (version: VersionSummary) => void;
  busy: boolean;
};

export function VersionHistory({ refreshKey, viewingId, onView, onRestore, busy }: VersionHistoryProps) {
  const { toast } = useFeedback();
  const { canPublish } = useEditorContext();
  const [versions, setVersions] = useState<VersionSummary[] | null>(null);

  const load = useCallback(async () => {
    const result = await listVersions();
    if (result.ok) setVersions(result.data);
    else {
      setVersions([]);
      toast(result.error, "error");
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (versions === null) return <p className="adm-empty">Carregando histórico…</p>;
  if (versions.length === 0) return <p className="adm-empty">Nenhuma versão publicada ainda.</p>;

  return (
    <ol className="adm-versions">
      {versions.map((version) => (
        <li key={version.id} data-current={version.isCurrent} data-viewing={viewingId === version.id}>
          <div>
            <strong>
              Versão {version.version}
              {version.isCurrent && <span className="adm-badge adm-badge-live">No ar</span>}
            </strong>
            <span>{formatDateTime(version.createdAt)}</span>
            <span>
              {version.status === "restored" ? `Restaurada da versão ${version.restoredFromVersion}` : "Publicada"} por{" "}
              {version.createdByName ?? "usuário removido"}
            </span>
            {version.note && <em>“{version.note}”</em>}
          </div>
          <div className="adm-version-actions">
            <button type="button" className="adm-btn adm-btn-small" disabled={busy} onClick={() => onView(version)}>
              Visualizar
            </button>
            {canPublish && !version.isCurrent && (
              <button type="button" className="adm-btn adm-btn-small adm-btn-primary" disabled={busy} onClick={() => onRestore(version)}>
                Restaurar
              </button>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
