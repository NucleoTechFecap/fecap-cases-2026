"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { type EditorPost, type SavedPost, checkSlug, savePost } from "@/app/admin/blog/actions";
import { CoverImageEditor } from "@/components/admin/blog/CoverImageEditor";
import { type PostForm, type SetField, emptyPostForm } from "@/components/admin/blog/form";
import { PostSettings, type Schedule } from "@/components/admin/blog/PostSettings";
import { RelatedLinksEditor } from "@/components/admin/blog/RelatedLinksEditor";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { BlogSeoEditor } from "@/components/admin/blog/SeoEditor";
import { SourcesEditor } from "@/components/admin/blog/SourcesEditor";
import { StatusBadge } from "@/components/admin/blog/StatusBadge";
import { EditorContextProvider } from "@/components/admin/landing/EditorContext";
import { formatTime } from "@/components/admin/landing/helpers";
import { useFeedback } from "@/components/admin/ui/Feedback";
import { TextAreaField } from "@/components/admin/ui/Fields";
import { extractText } from "@/lib/blog/content";
import { slugify } from "@/lib/blog/slug";
import { type BlogCategory, type BlogTag, type PostStatus, effectiveStatus, fromDateTimeFields, toDateTimeFields } from "@/lib/blog/types";

type PostEditorProps = {
  initial: EditorPost | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  authorName: string;
  canEdit: boolean;
  canPublish: boolean;
};

type SlugState = "idle" | "checking" | "available" | "taken";

const AUTOSAVE_DELAY = 2500;
/** Id do rascunho criado em /admin/blog/new nesta aba (para sobreviver a um F5). */
const NEW_POST_KEY = "fecap-blog-new-post";
const isLive = (status: PostStatus) => status === "published" || status === "scheduled";

function initialForm(initial: EditorPost | null, authorName: string): PostForm {
  if (!initial) return emptyPostForm(authorName);
  const form: Partial<EditorPost> = { ...initial };
  for (const key of ["id", "updatedAt", "tags"] as const) delete form[key];
  return form as PostForm;
}

function initialSchedule(initial: EditorPost | null): Schedule {
  const isFuture = initial?.status === "scheduled" && initial.publishedAt !== null && new Date(initial.publishedAt) > new Date();
  return isFuture ? { mode: "schedule", ...toDateTimeFields(initial.publishedAt) } : { mode: "now", date: "", time: "" };
}

export function PostEditor({ initial, categories, tags: initialTags, authorName, canEdit, canPublish }: PostEditorProps) {
  const { toast, confirm } = useFeedback();
  const router = useRouter();
  const titleId = useId();
  const slugId = useId();

  const [form, setForm] = useState<PostForm>(() => initialForm(initial, authorName));
  const [postId, setPostId] = useState<string | null>(initial?.id ?? null);
  const [savedStatus, setSavedStatus] = useState<PostStatus>(initial ? effectiveStatus(initial.status, initial.publishedAt) : "draft");
  const [schedule, setSchedule] = useState<Schedule>(() => initialSchedule(initial));
  const [tags, setTags] = useState(initialTags);
  const [slugTouched, setSlugTouched] = useState(initial !== null);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [words, setWords] = useState(() => extractText(form.content).split(/\s+/).filter(Boolean).length);

  // `version` sobe a cada edição; a publicação está "suja" enquanto for diferente da última versão salva.
  const [version, setVersion] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [saving, setSaving] = useState<null | "autosave" | "draft" | "publish" | "archive" | "preview">(null);
  const [savedAt, setSavedAt] = useState<string | null>(initial?.updatedAt ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formRef = useRef(form);
  const versionRef = useRef(0);
  const postIdRef = useRef(postId);
  const inflight = useRef<Promise<unknown> | null>(null);
  const failedAutosaveVersion = useRef(-1);

  const dirty = version !== savedVersion;

  const set = useCallback<SetField>((key, value) => {
    formRef.current = { ...formRef.current, [key]: value };
    versionRef.current += 1;
    setForm(formRef.current);
    setVersion(versionRef.current);
  }, []);

  function setTitle(title: string) {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  }

  // ---------- Salvamento ----------
  const persist = useCallback(
    async (overrides: Partial<PostForm>, kind: NonNullable<typeof saving>): Promise<SavedPost | null> => {
      if (inflight.current) await inflight.current.catch(() => undefined);

      const snapshot = versionRef.current;
      const hadId = postIdRef.current !== null;
      setSaving(kind);
      setSaveError(null);

      const request = savePost(postIdRef.current, { ...formRef.current, slug: slugify(formRef.current.slug, 120), ...overrides }, kind === "autosave" ? "autosave" : "manual");
      inflight.current = request;
      const result = await request.catch(() => ({ ok: false as const, error: "Erro ao salvar publicação. Verifique sua conexão." }));
      inflight.current = null;
      setSaving(null);

      if (!result.ok) {
        setSaveError(result.error);
        if (kind === "autosave") failedAutosaveVersion.current = snapshot;
        else toast(result.error, "error");
        return null;
      }

      postIdRef.current = result.data.id;
      setPostId(result.data.id);
      // Primeira gravação em /admin/blog/new. Trocar a URL durante o autosave faria o Next remontar o
      // editor (perdendo foco, cursor e o que estava sendo digitado), então:
      //  - autosave: a URL fica como está e o id é lembrado nesta aba (ver efeito de "reload" abaixo);
      //  - salvamento manual: navega para a tela de edição, já com tudo gravado.
      if (!hadId) {
        try {
          window.sessionStorage.setItem(NEW_POST_KEY, result.data.id);
        } catch {
          // sessionStorage indisponível: só perde a conveniência do F5.
        }
      }
      if (kind !== "autosave" && window.location.pathname.endsWith("/new")) router.replace(`/admin/blog/${result.data.id}/edit`);

      formRef.current = { ...formRef.current, status: result.data.status, publishedAt: result.data.publishedAt };
      setForm(formRef.current);
      setSavedStatus(effectiveStatus(result.data.status, result.data.publishedAt));
      setSavedVersion(snapshot);
      setSavedAt(result.data.savedAt);
      setSlugTouched(true);
      return result.data;
    },
    [toast, router],
  );

  // F5 em /admin/blog/new depois do autosave: volta para o rascunho em vez de abrir um editor vazio.
  useEffect(() => {
    if (initial !== null) return;
    try {
      const saved = window.sessionStorage.getItem(NEW_POST_KEY);
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (saved && navigation?.type === "reload") return router.replace(`/admin/blog/${saved}/edit`);
      window.sessionStorage.removeItem(NEW_POST_KEY);
    } catch {
      // sem sessionStorage não há o que restaurar
    }
  }, [initial, router]);

  // Autosave: só rascunhos, nunca publica, e não insiste numa versão que o servidor já recusou.
  useEffect(() => {
    const ready = canEdit && dirty && saving === null && savedStatus === "draft" && form.title.trim().length >= 3 && form.slug !== "" && slugState !== "taken";
    if (!ready || failedAutosaveVersion.current === version) return;

    const timer = window.setTimeout(() => void persist({ status: "draft" }, "autosave"), AUTOSAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [canEdit, dirty, saving, savedStatus, form.title, form.slug, slugState, version, persist]);

  // Alterações não salvas: aviso do navegador ao fechar/recarregar/navegar.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Unicidade do slug (o servidor confere de novo ao salvar).
  useEffect(() => {
    if (!form.slug) return setSlugState("idle");
    setSlugState("checking");
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const result = await checkSlug(form.slug, postIdRef.current);
      if (!cancelled) setSlugState(result.ok ? (result.data.available ? "available" : "taken") : "idle");
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [form.slug]);

  // ---------- Ações ----------
  function validateBasics(): boolean {
    if (form.title.trim().length < 3) return toast("Informe o título da publicação.", "error"), false;
    if (!form.slug) return toast("Informe o slug da publicação.", "error"), false;
    if (slugState === "taken") return toast("Este slug já está em uso. Escolha outro.", "error"), false;
    return true;
  }

  async function handleSaveDraft() {
    if (!validateBasics()) return;
    if (isLive(savedStatus)) {
      const confirmed = await confirm({
        title: "Voltar para rascunho?",
        description: "A publicação sairá do ar até ser publicada novamente.",
        confirmLabel: "Despublicar e salvar",
        destructive: true,
      });
      if (!confirmed) return;
    }
    if (await persist({ status: "draft" }, "draft")) toast("Rascunho salvo.");
  }

  async function handlePublish() {
    if (!validateBasics()) return;
    const now = new Date();

    if (schedule.mode === "schedule") {
      const iso = fromDateTimeFields(schedule.date, schedule.time);
      if (!iso) return toast("Informe a data e a hora do agendamento.", "error");
      if (new Date(iso) <= now) return toast("Para agendar, escolha uma data e hora no futuro.", "error");
      if (await persist({ status: "scheduled", publishedAt: iso }, "publish")) toast("Publicação agendada.");
      return;
    }

    const wasPublished = savedStatus === "published";
    if (!wasPublished) {
      const confirmed = await confirm({ title: "Publicar agora?", description: "A publicação ficará visível para todos em /blog.", confirmLabel: "Publicar" });
      if (!confirmed) return;
    }

    // Mantém a data original ao atualizar; qualquer outro caso publica com a data de agora.
    const keepDate = wasPublished && form.publishedAt !== null && new Date(form.publishedAt) <= now;
    const saved = await persist({ status: "published", publishedAt: keepDate ? form.publishedAt : now.toISOString() }, "publish");
    if (saved) toast(wasPublished ? "Publicação salva." : "Publicação publicada.");
  }

  async function handleArchive() {
    if (!validateBasics()) return;
    const confirmed = await confirm({ title: "Arquivar publicação?", description: "Ela sai do site, mas continua disponível no painel.", confirmLabel: "Arquivar", destructive: true });
    if (confirmed && (await persist({ status: "archived" }, "archive"))) toast("Publicação arquivada.");
  }

  async function handlePreview() {
    // A aba é aberta já no clique (senão o navegador bloqueia o pop-up) e recebe o endereço depois de salvar.
    const tab = window.open("about:blank", "_blank");
    let id = postIdRef.current;

    if (canEdit && dirty && savedStatus === "draft") {
      if (!validateBasics()) return tab?.close();
      id = (await persist({ status: "draft" }, "preview"))?.id ?? null;
    } else if (dirty && id) {
      toast("O preview mostra a última versão salva. Salve para ver as alterações.", "info");
    }

    if (!id) {
      tab?.close();
      return toast("Salve o rascunho para visualizar o preview.", "info");
    }
    if (tab) tab.location.href = `/admin/blog/${id}/preview`;
  }

  async function handleBack() {
    if (dirty) {
      const confirmed = await confirm({ title: "Existem alterações não salvas.", description: "Deseja realmente sair? As alterações serão perdidas.", confirmLabel: "Sair sem salvar", destructive: true });
      if (!confirmed) return;
    }
    setSavedVersion(versionRef.current);
    // Espera o React remover o aviso de "beforeunload" antes de navegar.
    window.setTimeout(() => window.location.assign("/admin/blog"), 0);
  }

  const statusText =
    saving !== null ? (saving === "publish" ? "Publicando…" : "Salvando…") : saveError ? "Erro ao salvar" : dirty ? "Alterações não salvas" : savedAt ? `Salvo às ${formatTime(savedAt)}` : "";

  const primaryLabel = schedule.mode === "schedule" ? "Agendar" : savedStatus === "published" ? "Atualizar publicação" : "Publicar";
  const busy = saving !== null && saving !== "autosave";

  return (
    <EditorContextProvider value={{ canEdit, canPublish }}>
      <header className="adm-topbar">
        <div className="adm-topbar-title">
          <nav className="adm-breadcrumb" aria-label="Você está em">
            <button type="button" className="adm-linklike" onClick={handleBack}>
              ← Blog
            </button>
          </nav>
          <h1>{postId ? "Editar publicação" : "Nova publicação"}</h1>
        </div>

        <div className="adm-topbar-status" role="status" aria-live="polite">
          <StatusBadge status={savedStatus} />
          <span className="adm-status-text" data-error={saveError !== null} title={saveError ?? undefined}>
            {statusText}
          </span>
        </div>

        <div className="adm-topbar-actions">
          <button type="button" className="adm-btn" disabled={!canEdit || busy} onClick={handleSaveDraft}>
            {saving === "draft" ? "Salvando…" : "Salvar rascunho"}
          </button>
          <button type="button" className="adm-btn" disabled={busy} onClick={handlePreview}>
            Preview
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            disabled={!canPublish || busy}
            title={canPublish ? undefined : "Somente administradores podem publicar."}
            onClick={handlePublish}
          >
            {saving === "publish" ? "Publicando…" : primaryLabel}
          </button>
        </div>
      </header>

      {!canEdit && <p className="adm-banner">Seu perfil é somente leitura: você pode visualizar, mas não alterar publicações.</p>}
      {saveError && (
        <p className="adm-banner" role="alert">
          {saveError}
        </p>
      )}

      <div className="adm-page">
        <fieldset className="adm-blog-fieldset" disabled={!canEdit}>
          <div className="adm-blog-layout">
            <div className="adm-blog-main">
              <section className="adm-card">
                <div className="adm-field">
                  <label htmlFor={titleId}>Título do artigo</label>
                  <input
                    id={titleId}
                    className="adm-input adm-blog-title"
                    value={form.title}
                    maxLength={160}
                    required
                    placeholder="Como a tecnologia está transformando os eventos universitários"
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div className="adm-field">
                  <label htmlFor={slugId}>Slug</label>
                  <div className="adm-blog-slug">
                    <span aria-hidden="true">/blog/</span>
                    <input
                      id={slugId}
                      className="adm-input"
                      value={form.slug}
                      maxLength={120}
                      spellCheck={false}
                      aria-invalid={slugState === "taken"}
                      onChange={(event) => {
                        setSlugTouched(true);
                        // Normaliza enquanto digita; o hífen final só é aparado ao sair do campo.
                        const loose = event.target.value
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+/, "");
                        set("slug", loose.slice(0, 120));
                      }}
                      onBlur={() => form.slug !== slugify(form.slug, 120) && set("slug", slugify(form.slug, 120))}
                    />
                    <button
                      type="button"
                      className="adm-btn adm-btn-small"
                      onClick={() => {
                        setSlugTouched(false);
                        set("slug", slugify(form.title));
                      }}
                    >
                      Gerar do título
                    </button>
                  </div>
                  {slugState === "taken" ? (
                    <small className="adm-error">Já existe uma publicação com este slug.</small>
                  ) : (
                    <small>{slugState === "checking" ? "Verificando disponibilidade…" : slugState === "available" ? "Endereço disponível." : "Gerado automaticamente a partir do título."}</small>
                  )}
                </div>

                <TextAreaField
                  label="Resumo"
                  rows={3}
                  value={form.excerpt}
                  maxLength={300}
                  onChange={(next) => set("excerpt", next)}
                  hint="Usado nos cards, na busca, no compartilhamento e como descrição de SEO. Ideal: 160 a 300 caracteres."
                />
              </section>

              <section className="adm-card" aria-label="Conteúdo">
                <div className="adm-blog-content-head">
                  <span className="adm-label">Conteúdo</span>
                  <small>
                    {words} {words === 1 ? "palavra" : "palavras"} · {Math.max(1, Math.round(words / 200))} min de leitura
                  </small>
                </div>
                <RichTextEditor
                  initial={form.content}
                  editable={canEdit}
                  onChange={(doc, count) => {
                    set("content", doc);
                    setWords(count);
                  }}
                />
              </section>

              <section className="adm-card">
                <SourcesEditor sources={form.sources} onChange={(next) => set("sources", next)} />
                <RelatedLinksEditor links={form.relatedLinks} onChange={(next) => set("relatedLinks", next)} />
              </section>
            </div>

            <aside className="adm-blog-side adm-card" aria-label="Configurações da publicação">
              <PostSettings
                form={form}
                set={set}
                savedStatus={savedStatus}
                schedule={schedule}
                onScheduleChange={setSchedule}
                categories={categories}
                tags={tags}
                onTagCreated={(tag) => setTags((current) => (current.some((item) => item.id === tag.id) ? current : [...current, tag]))}
                canEdit={canEdit}
                canPublish={canPublish}
                onArchive={postId ? handleArchive : undefined}
              />
              <CoverImageEditor form={form} set={set} />
              <BlogSeoEditor form={form} set={set} />
            </aside>
          </div>
        </fieldset>
      </div>
    </EditorContextProvider>
  );
}
