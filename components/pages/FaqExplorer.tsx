"use client";

import { useMemo, useState } from "react";
import { FaqAccordion } from "@/components/FaqAccordion";
import type { FaqItem } from "@/data/fecapCases";

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

type FaqExplorerProps = { items: FaqItem[]; searchLabel?: string; searchPlaceholder?: string };

export function FaqExplorer({ items, searchLabel = "Buscar nas dúvidas", searchPlaceholder = "Ex.: certificado, inscrição, horário…" }: FaqExplorerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return items;
    return items.filter((item) => normalize(`${item.question} ${item.answer}`).includes(term));
  }, [items, query]);

  return (
    <div className="faq-explorer">
      <label className="faq-search">
        <span>{searchLabel}</span>
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <p className="faq-count" role="status">
        {filtered.length === items.length
          ? `${items.length} perguntas frequentes`
          : `${filtered.length} de ${items.length} perguntas`}
      </p>

      {filtered.length > 0 ? (
        // A key reinicia o acordeão quando o filtro muda.
        <FaqAccordion items={filtered} initialOpenIndex={query ? 0 : null} key={query} />
      ) : (
        <p className="faq-empty">
          Nenhuma pergunta encontrada para “{query}”. <a href="/contato">Fale com a organização</a>.
        </p>
      )}
    </div>
  );
}
