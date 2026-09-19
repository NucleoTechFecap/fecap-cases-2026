"use client";

import { useEffect, useState } from "react";
import { type AuditEntry, type ContactMessage, listAuditLogs, listContactMessages } from "@/app/admin/actions";
import { describeAudit, formatDateTime } from "@/components/admin/landing/helpers";
import { Group } from "@/components/admin/ui/Fields";

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
                <strong>{describeAudit(entry)}</strong>
                <span>{formatDateTime(entry.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Group>
    </>
  );
}
