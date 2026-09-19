"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = { title: string; onClose: () => void; wide?: boolean; children: React.ReactNode };

/** Diálogo genérico do painel (mesmo visual dos diálogos existentes). Fecha com Esc ou clique fora. */
export function Modal({ title, onClose, wide = false, children }: ModalProps) {
  const titleId = useId();
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const target = dialog.current?.querySelector<HTMLElement>("[data-autofocus], input, textarea, select, button");
    target?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="adm-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`adm-dialog ${wide ? "adm-dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={dialog}>
        <header className="adm-dialog-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="adm-btn adm-btn-small" onClick={onClose}>
            Fechar
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
