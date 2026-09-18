"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="adm-login-form">
      <input type="hidden" name="next" value={next} />
      <label>
        E-mail
        <input className="adm-input" name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Senha
        <input className="adm-input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && (
        <p className="adm-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="adm-btn adm-btn-primary" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
