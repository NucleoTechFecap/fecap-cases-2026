"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Toast = { id: number; message: string; tone: "success" | "error" | "info" };

type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
};

type FeedbackContext = {
  toast: (message: string, tone?: Toast["tone"]) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const Context = createContext<FeedbackContext | null>(null);

export function useFeedback(): FeedbackContext {
  const context = useContext(Context);
  if (!context) throw new Error("useFeedback precisa estar dentro de <FeedbackProvider>.");
  return context;
}

/** Toasts + diálogo de confirmação do painel (sem alert()/confirm() do navegador). */
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOptions & { resolve: (value: boolean) => void }) | null>(null);
  const nextId = useRef(1);
  const confirmButton = useRef<HTMLButtonElement>(null);

  const toast = useCallback<FeedbackContext["toast"]>((message, tone = "success") => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-3), { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), tone === "error" ? 7000 : 4000);
  }, []);

  const confirm = useCallback<FeedbackContext["confirm"]>(
    (options) => new Promise<boolean>((resolve) => setDialog({ ...options, resolve })),
    [],
  );

  const close = useCallback(
    (value: boolean) => {
      dialog?.resolve(value);
      setDialog(null);
    },
    [dialog],
  );

  useEffect(() => {
    if (!dialog) return;
    confirmButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && close(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog, close]);

  return (
    <Context.Provider value={{ toast, confirm }}>
      {children}

      <div className="adm-toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div className="adm-toast" data-tone={item.tone} key={item.id}>
            {item.message}
          </div>
        ))}
      </div>

      {dialog && (
        <div className="adm-dialog-backdrop" onClick={() => close(false)}>
          <div
            className="adm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="adm-dialog-title"
            aria-describedby="adm-dialog-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="adm-dialog-title">{dialog.title}</h2>
            <p id="adm-dialog-description">{dialog.description}</p>
            <div className="adm-dialog-actions">
              <button type="button" className="adm-btn" onClick={() => close(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className={`adm-btn ${dialog.destructive ? "adm-btn-danger" : "adm-btn-primary"}`}
                onClick={() => close(true)}
                ref={confirmButton}
              >
                {dialog.confirmLabel ?? "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Context.Provider>
  );
}
