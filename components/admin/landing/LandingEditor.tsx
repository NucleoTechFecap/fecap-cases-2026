"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type EditorData,
  type VersionSummary,
  discardDraft,
  getVersionContent,
  logItemAction,
  publishLanding,
  restoreVersion,
  saveDraft,
} from "@/app/admin/actions";
import { ActivityPanel } from "@/components/admin/landing/ActivityPanel";
import { DesignEditor } from "@/components/admin/landing/DesignEditor";
import { EditorContextProvider } from "@/components/admin/landing/EditorContext";
import { FooterEditor } from "@/components/admin/landing/FooterEditor";
import { HeaderEditor } from "@/components/admin/landing/HeaderEditor";
import { formatDateTime, formatTime } from "@/components/admin/landing/helpers";
import { LandingPreview } from "@/components/admin/landing/LandingPreview";
import { LandingSidebar, sectionLabel } from "@/components/admin/landing/LandingSidebar";
import { MediaLibrary } from "@/components/admin/landing/MediaLibrary";
import { SectionEditor } from "@/components/admin/landing/SectionEditor";
import { SeoEditor } from "@/components/admin/landing/SeoEditor";
import { SettingsEditor } from "@/components/admin/landing/SettingsEditor";
import { VersionHistory } from "@/components/admin/landing/VersionHistory";
import { PAGE_TARGET_LABELS, PageEditor, type PageTarget, PagesList } from "@/components/admin/pages/PagesEditor";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { Group, Toggle } from "@/components/admin/ui/Fields";
import { DEFAULT_LANDING_CONFIG, defaultSection } from "@/lib/landing/defaults";
import { defaultPage } from "@/lib/landing/pages-defaults";
import { describeIssues } from "@/lib/landing/parse";
import { type LandingConfig, type LandingSection, landingConfigSchema } from "@/lib/landing/schema";

const TABS = [
  { id: "content", label: "Conteúdo" },
  { id: "pages", label: "Páginas" },
  { id: "design", label: "Design" },
  { id: "seo", label: "SEO" },
  { id: "media", label: "Mídia" },
  { id: "history", label: "Histórico" },
  { id: "settings", label: "Configurações" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type Busy = "idle" | "saving" | "publishing" | "discarding" | "restoring";
type Viewing = { id: string; version: number; config: LandingConfig };

type LandingEditorProps = { initial: EditorData; canEdit: boolean; canPublish: boolean };

export function LandingEditor({ initial, canEdit, canPublish }: LandingEditorProps) {
  const { toast, confirm } = useFeedback();

  const [config, setConfig] = useState(initial.draft);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initial.draft));
  const [published, setPublished] = useState({ at: initial.publishedAt, version: initial.publishedVersion });
  const [unpublished, setUnpublished] = useState(initial.hasUnpublishedChanges);
  const [savedAt, setSavedAt] = useState<string | null>(initial.draftUpdatedAt);
  const [busy, setBusy] = useState<Busy>("idle");
  const [autosave, setAutosave] = useState(true);
  const [tab, setTab] = useState<TabId>("content");
  const [target, setTarget] = useState<string | null>(null);
  const [pageTarget, setPageTarget] = useState<PageTarget | null>(null);
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [refreshKey, setRefreshKey] = useState(0);

  const snapshot = useMemo(() => JSON.stringify(config), [config]);
  const dirty = snapshot !== savedSnapshot;
  const locked = !canEdit || viewing !== null;

  // A validação completa roda no servidor; aqui só antecipamos o erro para o admin.
  const validation = useMemo(() => landingConfigSchema.safeParse(config), [config]);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const persist = useCallback(
    async (source: "manual" | "autosave") => {
      if (busyRef.current !== "idle") return false;

      const current = config;
      const currentSnapshot = JSON.stringify(current);
      setBusy("saving");
      const result = await saveDraft(current, source);
      setBusy("idle");

      if (!result.ok) {
        if (source === "manual") toast(result.error, "error");
        return false;
      }

      setSavedSnapshot(currentSnapshot);
      setSavedAt(result.data.savedAt);
      setUnpublished(true);
      if (source === "manual") toast("Rascunho salvo.");
      return true;
    },
    [config, toast],
  );

  // Autosave: grava SOMENTE o rascunho, nunca publica.
  useEffect(() => {
    if (!autosave || !dirty || locked || !validation.success) return;
    const timer = window.setTimeout(() => void persist("autosave"), 2500);
    return () => window.clearTimeout(timer);
  }, [autosave, dirty, locked, validation.success, persist]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Existem alterações não salvas.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function ensureValid(): boolean {
    if (validation.success) return true;
    toast(`Revise os campos antes de continuar — ${describeIssues(validation.error.issues)}`, "error");
    return false;
  }

  async function handlePublish() {
    if (!ensureValid() || busy !== "idle") return;

    const confirmed = await confirm({
      title: "Publicar alterações?",
      description: "O rascunho atual passa a ser a versão vista por todos os visitantes. A versão anterior continua no histórico.",
      confirmLabel: "Publicar",
    });
    if (!confirmed) return;

    const currentSnapshot = JSON.stringify(config);
    setBusy("publishing");
    const result = await publishLanding(config, "");
    setBusy("idle");

    if (!result.ok) return toast(result.error, "error");

    setSavedSnapshot(currentSnapshot);
    setSavedAt(result.data.publishedAt);
    setPublished({ at: result.data.publishedAt, version: result.data.version });
    setUnpublished(false);
    setRefreshKey((key) => key + 1);
    toast(`Landing publicada com sucesso (versão ${result.data.version}).`);
  }

  async function handleDiscard() {
    if (busy !== "idle") return;

    const confirmed = await confirm({
      title: "Descartar alterações?",
      description: "O rascunho volta a ficar igual à versão publicada. Essa ação não pode ser desfeita.",
      confirmLabel: "Descartar",
      destructive: true,
    });
    if (!confirmed) return;

    setBusy("discarding");
    const result = await discardDraft();
    setBusy("idle");

    if (!result.ok) return toast(result.error, "error");

    setConfig(result.data.draft);
    setSavedSnapshot(JSON.stringify(result.data.draft));
    setUnpublished(false);
    setTarget(null);
    setPageTarget(null);
    setRefreshKey((key) => key + 1);
    toast("Alterações descartadas.");
  }

  async function handleViewVersion(version: VersionSummary) {
    const result = await getVersionContent(version.id);
    if (!result.ok) return toast(result.error, "error");

    setViewing({ id: version.id, version: result.data.version, config: result.data.config });
    setMobileView("preview");
  }

  async function handleRestore(version: VersionSummary) {
    if (busy !== "idle") return;

    const confirmed = await confirm({
      title: `Restaurar a versão ${version.version}?`,
      description: "O conteúdo dessa versão volta ao ar como uma NOVA versão. O histórico é preservado e o rascunho atual é substituído.",
      confirmLabel: "Restaurar versão",
    });
    if (!confirmed) return;

    setBusy("restoring");
    const result = await restoreVersion(version.id);
    setBusy("idle");

    if (!result.ok) return toast(result.error, "error");

    setConfig(result.data.draft);
    setSavedSnapshot(JSON.stringify(result.data.draft));
    setPublished({ at: result.data.publishedAt, version: result.data.version });
    setUnpublished(false);
    setViewing(null);
    setRefreshKey((key) => key + 1);
    toast(`Versão ${version.version} restaurada como versão ${result.data.version}.`);
  }

  async function handleResetSection(section: LandingSection) {
    const confirmed = await confirm({
      title: "Restaurar configuração padrão?",
      description: "Tem certeza que deseja restaurar esta seção para a configuração padrão? Textos, imagens e cores desta seção voltam ao original.",
      confirmLabel: "Restaurar seção",
      destructive: true,
    });
    if (!confirmed) return;

    const fresh = { ...defaultSection(section.type), id: section.id, enabled: section.enabled } as LandingSection;
    setConfig((current) => ({ ...current, sections: current.sections.map((item) => (item.id === section.id ? fresh : item)) }));
    void logItemAction("section_reset", sectionLabel(section, config.sections));
  }

  async function handleResetPage(page: PageTarget) {
    const confirmed = await confirm({
      title: "Restaurar configuração padrão?",
      description: `Os textos e itens de "${PAGE_TARGET_LABELS[page]}" voltam ao conteúdo original do site. Nada é publicado até você clicar em Publicar.`,
      confirmLabel: "Restaurar página",
      destructive: true,
    });
    if (!confirmed) return;

    setConfig((current) => ({ ...current, pages: { ...current.pages, [page]: defaultPage(page) } }));
    void logItemAction("section_reset", `Página: ${PAGE_TARGET_LABELS[page]}`);
  }

  async function handleResetAll() {
    const confirmed = await confirm({
      title: "Restaurar TODA a landing page?",
      description: "Todas as seções, páginas internas, cores, SEO e configurações do rascunho voltam ao conteúdo original do site. Nada é publicado até você clicar em Publicar.",
      confirmLabel: "Sim, restaurar tudo",
      destructive: true,
    });
    if (!confirmed) return;

    setConfig(structuredClone(DEFAULT_LANDING_CONFIG));
    setTarget(null);
    setPageTarget(null);
    void logItemAction("landing_reset", "Rascunho restaurado ao padrão");
    toast("Rascunho restaurado ao padrão. Publique para aplicar no site.", "info");
  }

  const updateSection = (next: LandingSection) =>
    setConfig((current) => ({ ...current, sections: current.sections.map((item) => (item.id === next.id ? next : item)) }));

  const activeSection = target && target !== "header" && target !== "footer" ? config.sections.find((section) => section.id === target) : undefined;

  const statusText =
    busy === "saving" ? "Salvando…" : busy === "publishing" ? "Publicando…" : dirty ? "Alterações não salvas" : savedAt ? `Salvo às ${formatTime(savedAt)}` : "";

  return (
    <EditorContextProvider value={{ canEdit, canPublish }}>
      <div className="adm-editor" data-mobile-view={mobileView}>
        <header className="adm-topbar">
          <div className="adm-topbar-title">
            <h1>Site e páginas</h1>
            <p>
              Última publicação: <strong>{published.at ? formatDateTime(published.at).replace(",", " às") : "ainda não publicada"}</strong>
              {published.version !== null && <> · versão {published.version}</>}
            </p>
          </div>

          <div className="adm-topbar-status" aria-live="polite">
            {(unpublished || dirty) && <span className="adm-badge adm-badge-warning">Alterações não publicadas</span>}
            <span className="adm-status-text">{statusText}</span>
          </div>

          <div className="adm-topbar-actions">
            <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">
              Visualizar página ↗
            </a>
            {canPublish && (
              <button type="button" className="adm-btn" disabled={busy !== "idle" || viewing !== null || (!unpublished && !dirty)} onClick={handleDiscard}>
                Descartar alterações
              </button>
            )}
            {canEdit && (
              <button type="button" className="adm-btn" disabled={busy !== "idle" || locked || !dirty} onClick={() => ensureValid() && void persist("manual")}>
                {busy === "saving" ? "Salvando…" : "Salvar rascunho"}
              </button>
            )}
            {canPublish && (
              <button type="button" className="adm-btn adm-btn-primary" disabled={busy !== "idle" || viewing !== null || (!unpublished && !dirty)} onClick={handlePublish}>
                {busy === "publishing" ? "Publicando…" : "Publicar alterações"}
              </button>
            )}
          </div>
        </header>

        {!canEdit && <p className="adm-banner">Você está em modo de visualização: seu perfil não permite editar a landing page.</p>}
        {viewing && (
          <div className="adm-banner adm-banner-strong">
            <span>
              Visualizando a <strong>versão {viewing.version}</strong>. O editor fica bloqueado enquanto isso.
            </span>
            <button type="button" className="adm-btn adm-btn-small" onClick={() => setViewing(null)}>
              Voltar ao rascunho
            </button>
          </div>
        )}

        <div className="adm-mobile-switch" role="group" aria-label="Alternar entre editor e preview">
          <button type="button" aria-pressed={mobileView === "editor"} onClick={() => setMobileView("editor")}>
            Editor
          </button>
          <button type="button" aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}>
            Preview
          </button>
        </div>

        <div className="adm-workspace">
          <section className="adm-panel" aria-label="Editor">
            <nav className="adm-tabs" aria-label="Áreas do editor">
              {TABS.map((item) => (
                <button
                  type="button"
                  aria-current={tab === item.id ? "page" : undefined}
                  onClick={() => {
                    setTab(item.id);
                    setTarget(null);
                    setPageTarget(null);
                  }}
                  key={item.id}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* A rolagem fica no div: <fieldset> com overflow vaza a altura para a página no Chrome. */}
            <div className="adm-panel-body">
              <fieldset className="adm-panel-fields" disabled={locked && tab !== "history" && tab !== "media"}>
                {tab === "content" && target === null && (
                  <>
                    <p className="adm-intro">Escolha uma seção para editar. Arraste para mudar a ordem e use a chave para mostrar ou ocultar.</p>
                    <LandingSidebar config={config} onEdit={setTarget} onSectionsChange={(sections) => setConfig((current) => ({ ...current, sections }))} />
                  </>
                )}

                {tab === "content" && target !== null && (
                  <>
                    <div className="adm-breadcrumb">
                      <button type="button" className="adm-btn adm-btn-small" onClick={() => setTarget(null)}>
                        ← Todas as seções
                      </button>
                      <h2>{target === "header" ? "Header" : target === "footer" ? "Footer" : activeSection ? sectionLabel(activeSection, config.sections) : ""}</h2>
                      {activeSection && (
                        <button type="button" className="adm-btn adm-btn-small" onClick={() => handleResetSection(activeSection)}>
                          Restaurar padrão
                        </button>
                      )}
                    </div>

                    {target === "header" && <HeaderEditor value={config.header} onChange={(header) => setConfig((current) => ({ ...current, header }))} />}
                    {target === "footer" && <FooterEditor value={config.footer} onChange={(footer) => setConfig((current) => ({ ...current, footer }))} />}
                    {activeSection && (
                      <>
                        <Toggle label="Seção visível no site" checked={activeSection.enabled} onChange={(enabled) => updateSection({ ...activeSection, enabled })} />
                        <SectionEditor section={activeSection} onChange={updateSection} />
                      </>
                    )}
                  </>
                )}

                {tab === "pages" && pageTarget === null && (
                  <>
                    <p className="adm-intro">
                      Escolha uma página do site para editar. Header, footer, cores e faixa são os mesmos da landing. As alterações entram no mesmo rascunho e só vão ao ar em “Publicar alterações”.
                    </p>
                    <PagesList onEdit={setPageTarget} />
                  </>
                )}

                {tab === "pages" && pageTarget !== null && (
                  <>
                    <div className="adm-breadcrumb">
                      <button type="button" className="adm-btn adm-btn-small" onClick={() => setPageTarget(null)}>
                        ← Todas as páginas
                      </button>
                      <h2>{PAGE_TARGET_LABELS[pageTarget]}</h2>
                      <button type="button" className="adm-btn adm-btn-small" onClick={() => handleResetPage(pageTarget)}>
                        Restaurar padrão
                      </button>
                    </div>
                    <PageEditor target={pageTarget} pages={config.pages} onChange={(pages) => setConfig((current) => ({ ...current, pages }))} />
                  </>
                )}

                {tab === "design" && <DesignEditor value={config.design} onChange={(design) => setConfig((current) => ({ ...current, design }))} />}
                {tab === "seo" && <SeoEditor value={config.seo} siteName={config.event.name} onChange={(seo) => setConfig((current) => ({ ...current, seo }))} />}
                {tab === "media" && (
                  <Group title="Biblioteca de mídia" description="Imagens enviadas pelo painel. As que estão em uso na landing não podem ser excluídas.">
                    <MediaLibrary canEdit={canEdit} />
                  </Group>
                )}
                {tab === "history" && (
                  <Group title="Histórico de versões" description="Cada publicação gera uma versão. Restaurar cria uma nova versão — nada é apagado.">
                    <VersionHistory refreshKey={refreshKey} viewingId={viewing?.id ?? null} busy={busy !== "idle"} onView={handleViewVersion} onRestore={handleRestore} />
                  </Group>
                )}
                {tab === "settings" && (
                  <>
                    <SettingsEditor
                      event={config.event}
                      social={config.social}
                      onEventChange={(event) => setConfig((current) => ({ ...current, event }))}
                      onSocialChange={(social) => setConfig((current) => ({ ...current, social }))}
                    />
                    <Group title="Salvamento">
                      <Toggle label="Salvar rascunho automaticamente" hint="Nunca publica sozinho: só o rascunho é gravado." checked={autosave} onChange={setAutosave} />
                    </Group>
                    <ActivityPanel refreshKey={refreshKey} />
                    {canEdit && (
                      <Group title="Zona de risco">
                        <button type="button" className="adm-btn adm-btn-danger" onClick={handleResetAll}>
                          Restaurar toda a landing ao padrão
                        </button>
                      </Group>
                    )}
                  </>
                )}
              </fieldset>
            </div>
          </section>

          <section className="adm-preview-pane" aria-label="Preview">
            <LandingPreview config={viewing?.config ?? config} focusSectionId={viewing ? null : target} page={tab === "pages" ? pageTarget : null} />
          </section>
        </div>
      </div>
    </EditorContextProvider>
  );
}
