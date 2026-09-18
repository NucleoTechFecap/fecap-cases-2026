"use client";

import { type FormEvent, useState } from "react";
import { submitContact } from "@/app/actions/contact";
import type { SectionOf } from "@/lib/landing/schema";

type ContactFormProps = {
  texts: SectionOf<"contact">["content"]["form"];
  interactive?: boolean;
};

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm({ texts, interactive = true }: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!interactive || status === "sending") return;

    const form = event.currentTarget;
    setStatus("sending");

    try {
      const result = await submitContact(new FormData(form));
      setStatus(result.ok ? "sent" : "error");
      if (result.ok) form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        <span>{texts.nameLabel}</span>
        <input name="name" type="text" autoComplete="name" placeholder={texts.namePlaceholder} maxLength={120} required />
      </label>
      <label>
        <span>{texts.emailLabel}</span>
        <input name="email" type="email" autoComplete="email" placeholder={texts.emailPlaceholder} maxLength={200} required />
      </label>
      <label>
        <span>{texts.messageLabel}</span>
        <textarea name="message" rows={4} placeholder={texts.messagePlaceholder} maxLength={4000} required />
      </label>
      {/* Campo-isca: humanos não veem; robôs preenchem e são descartados no servidor. */}
      <input className="contact-honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <button className="button button-lime" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Enviando…" : texts.buttonLabel}
      </button>

      {(status === "sent" || status === "error") && (
        <p className="form-status" role="status" data-state={status}>
          {status === "sent" ? texts.successMessage : texts.errorMessage}
        </p>
      )}
    </form>
  );
}
