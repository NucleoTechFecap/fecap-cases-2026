"use client";

import { useState } from "react";

type ShareButtonsProps = { title: string; url: string };

/** Links de compartilhamento simples (sem SDKs). `url` vazio = usa o endereço atual do navegador. */
export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState<"idle" | "done" | "error">("idle");
  const resolve = () => url || window.location.href;

  async function copy() {
    try {
      await navigator.clipboard.writeText(resolve());
      setCopied("done");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied("idle"), 2500);
  }

  function open(build: (target: string) => string) {
    window.open(build(encodeURIComponent(resolve())), "_blank", "noopener,noreferrer");
  }

  return (
    <section className="article-share" aria-labelledby="article-share-title">
      <h2 id="article-share-title">Compartilhar</h2>
      <div>
        <button type="button" onClick={copy}>
          {copied === "done" ? "Link copiado ✓" : copied === "error" ? "Não foi possível copiar" : "Copiar link"}
        </button>
        <button type="button" onClick={() => open((target) => `https://www.linkedin.com/sharing/share-offsite/?url=${target}`)}>
          LinkedIn
        </button>
        <button type="button" onClick={() => open((target) => `https://wa.me/?text=${encodeURIComponent(`${title} — `)}${target}`)}>
          WhatsApp
        </button>
      </div>
      <span className="blog-sr-only" role="status" aria-live="polite">
        {copied === "done" ? "Link copiado para a área de transferência." : ""}
      </span>
    </section>
  );
}
