"use client";

import type { AdminPostRow } from "@/app/admin/blog/actions";
import { StatusBadge } from "@/components/admin/blog/StatusBadge";
import { formatDateTime } from "@/components/admin/landing/helpers";
import { formatShortDate } from "@/lib/blog/types";

export type RowAction = "duplicate" | "publish" | "unpublish" | "archive" | "delete";

type BlogTableProps = { rows: AdminPostRow[]; busyId: string | null; canEdit: boolean; canPublish: boolean; onAction: (row: AdminPostRow, action: RowAction) => void };

export function BlogTable({ rows, busyId, canEdit, canPublish, onAction }: BlogTableProps) {
  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th scope="col">Título</th>
            <th scope="col">Categoria</th>
            <th scope="col">Autor</th>
            <th scope="col">Status</th>
            <th scope="col">Data</th>
            <th scope="col">Última atualização</th>
            <th scope="col">
              <span className="adm-sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const live = row.status === "published";
            const viewHref = live ? `/blog/${row.slug}` : `/admin/blog/${row.id}/preview`;

            return (
              <tr key={row.id} data-busy={busyId === row.id}>
                <th scope="row" data-label="Título">
                  <a href={`/admin/blog/${row.id}/edit`}>{row.title}</a>
                  {row.isFeatured && <span className="adm-badge adm-badge-warning">Destaque</span>}
                  <small>/blog/{row.slug}</small>
                </th>
                <td data-label="Categoria">
                  {row.categoryName ? (
                    <span className="adm-blog-category">
                      <i style={{ background: row.categoryColor ?? undefined }} aria-hidden="true" />
                      {row.categoryName}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td data-label="Autor">{row.authorName || "—"}</td>
                <td data-label="Status">
                  <StatusBadge status={row.status} />
                </td>
                <td data-label="Data">{formatShortDate(row.publishedAt ?? row.createdAt)}</td>
                <td data-label="Última atualização">{formatDateTime(row.updatedAt)}</td>
                <td className="adm-table-actions">
                  <a className="adm-btn adm-btn-small" href={`/admin/blog/${row.id}/edit`}>
                    {canEdit ? "Editar" : "Abrir"}
                  </a>
                  <a className="adm-btn adm-btn-small" href={viewHref} target="_blank" rel="noopener noreferrer">
                    Visualizar
                  </a>
                  {canEdit && (
                    <button type="button" className="adm-btn adm-btn-small" onClick={() => onAction(row, "duplicate")}>
                      Duplicar
                    </button>
                  )}
                  {canPublish && (
                    <>
                      {row.status === "published" || row.status === "scheduled" ? (
                        <button type="button" className="adm-btn adm-btn-small" onClick={() => onAction(row, "unpublish")}>
                          Despublicar
                        </button>
                      ) : (
                        <button type="button" className="adm-btn adm-btn-small" onClick={() => onAction(row, "publish")}>
                          Publicar
                        </button>
                      )}
                      {row.status !== "archived" && (
                        <button type="button" className="adm-btn adm-btn-small" onClick={() => onAction(row, "archive")}>
                          Arquivar
                        </button>
                      )}
                      <button type="button" className="adm-btn adm-btn-small adm-btn-danger-text" onClick={() => onAction(row, "delete")}>
                        Excluir
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
