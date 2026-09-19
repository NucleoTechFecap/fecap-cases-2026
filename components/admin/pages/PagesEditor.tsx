"use client";

import { GaleriaEditor } from "@/components/admin/pages/GaleriaEditor";
import { BlogPageEditor, ContatoEditor, CtaEditor, DuvidasEditor, IngressosEditor, PatrocinadoresEditor, SobreEditor } from "@/components/admin/pages/PageEditors";
import { ProgramacaoEditor } from "@/components/admin/pages/ProgramacaoEditor";
import { PAGE_LABELS, PAGE_PATHS, type PageKey, type PagesConfig } from "@/lib/landing/pages-schema";

export type PageTarget = PageKey | "cta";

export const PAGE_TARGET_LABELS: Record<PageTarget, string> = { ...PAGE_LABELS, cta: "Chamada final das páginas" };

const PAGE_HINTS: Record<PageTarget, string> = {
  sobre: "Apresentação, números, pilares, roteiro e quem faz",
  programacao: "Dias, horários, workshops, ativações e palestrantes",
  patrocinadores: "Topo, motivos para apoiar e cotas",
  galeria: "Categorias e fotos do evento",
  ingressos: "Link da Sympla, passo a passo e avisos",
  duvidas: "Topo, cartão de ajuda e busca",
  contato: "Topo e canais oficiais",
  blog: "Topo da página do Blog",
  cta: "Faixa com as datas e botões no fim das páginas",
};

/** Lista das páginas internas do site. */
export function PagesList({ onEdit }: { onEdit: (target: PageTarget) => void }) {
  return (
    <div className="adm-sections">
      {(Object.keys(PAGE_TARGET_LABELS) as PageTarget[]).map((key) => (
        <div className="adm-section-row adm-page-row" key={key}>
          <div>
            <strong>{PAGE_TARGET_LABELS[key]}</strong>
            <small>{PAGE_HINTS[key]}</small>
          </div>
          <div className="adm-section-actions">
            {key !== "cta" && (
              <a className="adm-btn adm-btn-small" href={PAGE_PATHS[key]} target="_blank" rel="noopener noreferrer">
                Abrir ↗
              </a>
            )}
            <button type="button" className="adm-btn adm-btn-small adm-btn-primary" onClick={() => onEdit(key)}>
              Editar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type PageEditorProps = { target: PageTarget; pages: PagesConfig; onChange: (pages: PagesConfig) => void };

export function PageEditor({ target, pages, onChange }: PageEditorProps) {
  const update = <K extends PageTarget>(key: K, next: PagesConfig[K]) => onChange({ ...pages, [key]: next });

  switch (target) {
    case "sobre":
      return <SobreEditor value={pages.sobre} onChange={(next) => update("sobre", next)} />;
    case "programacao":
      return <ProgramacaoEditor value={pages.programacao} onChange={(next) => update("programacao", next)} />;
    case "patrocinadores":
      return <PatrocinadoresEditor value={pages.patrocinadores} onChange={(next) => update("patrocinadores", next)} />;
    case "galeria":
      return <GaleriaEditor value={pages.galeria} onChange={(next) => update("galeria", next)} />;
    case "ingressos":
      return <IngressosEditor value={pages.ingressos} onChange={(next) => update("ingressos", next)} />;
    case "duvidas":
      return <DuvidasEditor value={pages.duvidas} onChange={(next) => update("duvidas", next)} />;
    case "contato":
      return <ContatoEditor value={pages.contato} onChange={(next) => update("contato", next)} />;
    case "blog":
      return <BlogPageEditor value={pages.blog} onChange={(next) => update("blog", next)} />;
    case "cta":
      return <CtaEditor value={pages.cta} onChange={(next) => update("cta", next)} />;
  }
}
