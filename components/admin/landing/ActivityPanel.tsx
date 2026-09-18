"use client";

import { useEffect, useState } from "react";
import { type AuditEntry, type ContactMessage, listAuditLogs, listContactMessages } from "@/app/admin/actions";
import { formatDateTime } from "@/components/admin/landing/helpers";
import { Group } from "@/components/admin/ui/Fields";

const ACTION_LABELS: Record<string, string> = {
  landing_initialized: "Landing inicializada com o conteúdo do site",
  landing_updated: "Rascunho salvo",
  landing_published: "Landing publicada",
  landing_restored: "Versão restaurada",
  landing_draft_discarded: "Rascunho descartado",
  asset_uploaded: "Imagem enviada",
  asset_deleted: "Imagem excluída",
  sponsor_created: "Marca adicionada",
  sponsor_deleted: "Marca excluída",
  faq_created: "Pergunta adicionada",
  faq_deleted: "Pergunta excluída",
  section_reset: "Seção restaurada ao padrão",
  landing_reset: "Landing restaurada ao padrão",
};

function describe(entry: AuditEntry): string {
  const label = ACTION_LABELS[entry.action] ?? entry.action;
  const version = entry.metadata.version;
  const detail = entry.metadata.label;
  if (typeof version === "number") return `${label} (versão ${version})`;
  if (typeof detail === "string" && detail) return `${label}: ${detail}`;
  return label;
}

/** Auditoria e mensagens recebidas pelo formulário de contato. */
export function ActivityPanel({ refreshKey }: { refreshKey: number }) {
  const [logs, setLogs] = useState<AuditEntry[] | null>(null);
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);

  useEffect(() => {
    void listAuditLogs().then((result) => setLogs(result.ok ? result.data : []));
    void listContactMessages().then((result) => setMessages(result.ok ? result.data : []));
  }, [refreshKey]);

  return (
    <>
      <Group title="Mensagens recebidas" description="Enviadas pelo formulário de contato do site.">
        {messages === null ? (
          <p className="adm-empty">Carregando…</p>
        ) : messages.length === 0 ? (
          <p className="adm-empty">Nenhuma mensagem recebida ainda.</p>
        ) : (
          <ul className="adm-log">
            {messages.map((message) => (
              <li key={message.id}>
                <strong>
                  {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
                </strong>
                <p>{message.message}</p>
                <span>{formatDateTime(message.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Group>

      <Group title="Auditoria" description="Últimas ações administrativas. Este registro não pode ser editado nem apagado.">
        {logs === null ? (
          <p className="adm-empty">Carregando…</p>
        ) : logs.length === 0 ? (
          <p className="adm-empty">Nenhuma ação registrada.</p>
        ) : (
          <ul className="adm-log">
            {logs.map((entry) => (
              <li key={entry.id}>
                <strong>{describe(entry)}</strong>
                <span>{formatDateTime(entry.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Group>
    </>
  );
}
