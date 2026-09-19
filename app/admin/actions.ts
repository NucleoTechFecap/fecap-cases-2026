"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { type ActionResult, audit, fail, guard } from "@/lib/admin/guard";
import { getAdminSession } from "@/lib/landing/auth";
import { DEFAULT_LANDING_CONFIG } from "@/lib/landing/defaults";
import { describeIssues, parseLandingConfig } from "@/lib/landing/parse";
import { type LandingConfig, landingConfigSchema } from "@/lib/landing/schema";
import { sanitizeSvg } from "@/lib/landing/svg";
import { ASSETS_BUCKET, LANDING_CACHE_TAG, LANDING_SLUG, isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type EditorData = {
  draft: LandingConfig;
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;
  publishedVersion: number | null;
  draftUpdatedAt: string | null;
};

export type VersionSummary = {
  id: string;
  version: number;
  status: "published" | "restored";
  note: string | null;
  restoredFromVersion: number | null;
  createdByName: string | null;
  createdAt: string;
  isCurrent: boolean;
};

export type MediaAsset = {
  id: string;
  name: string;
  path: string;
  url: string;
  folder: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type AuditEntry = { id: number; action: string; entityType: string; metadata: Record<string, unknown>; createdAt: string };
export type ContactMessage = { id: string; name: string; email: string; message: string; createdAt: string };

function validateConfig(input: unknown): { config: LandingConfig } | { error: string } {
  const parsed = landingConfigSchema.safeParse(input);
  if (!parsed.success) return { error: `Revise os campos destacados — ${describeIssues(parsed.error.issues)}` };
  return { config: parsed.data };
}

function refreshPublicSite() {
  revalidateTag(LANDING_CACHE_TAG);
  revalidatePath("/", "layout");
}

// ---------- Sessão ----------
export async function signIn(_: { error: string } | null, formData: FormData): Promise<{ error: string }> {
  if (!isSupabaseConfigured) return { error: "O Supabase ainda não foi configurado neste ambiente." };

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Informe e-mail e senha." };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha inválidos." };

  const session = await getAdminSession();
  if (!session || session.role === "user") {
    await supabase.auth.signOut();
    return { error: "Esta conta não tem acesso ao painel administrativo." };
  }

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin/landing-page");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ---------- Rascunho / publicação ----------
export async function loadEditorData(): Promise<ActionResult<EditorData>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  // `attempt` muda a URL da consulta: durante o render o React memoiza GETs idênticos, e a
  // releitura após a inicialização receberia de novo o "não encontrado" da primeira tentativa.
  const query = (attempt: 1 | 2 = 1) =>
    ctx.supabase
      .from("landing_pages")
      .select("draft_content, draft_updated_at, published_at, published_version_id")
      .eq("slug", LANDING_SLUG)
      .limit(attempt)
      .maybeSingle();

  let { data: page, error } = await query();
  if (error) return fail("Não foi possível carregar a landing page.");

  // Primeira vez: migra o conteúdo atual do site para o banco (rascunho + versão 1).
  if (!page) {
    if (!ctx.session.canPublish) return fail("A landing ainda não foi inicializada. Peça a um administrador para abrir o painel.");

    const init = await ctx.supabase.rpc("ensure_landing", {
      p_slug: LANDING_SLUG,
      p_name: "Landing Page — FECAP Cases",
      p_content: DEFAULT_LANDING_CONFIG,
    });
    if (init.error) return fail("Não foi possível inicializar a landing page.");

    // Sem revalidar aqui: esta função roda durante o render da página (o Next proíbe revalidateTag
    // nesse momento) e a versão 1 é idêntica ao conteúdo padrão que o site já exibe.
    ({ data: page, error } = await query(2));
    if (error || !page) return fail("Não foi possível carregar a landing page.");
  }

  let publishedVersion: number | null = null;
  let publishedContent: unknown = null;
  if (page.published_version_id) {
    const { data: version } = await ctx.supabase
      .from("landing_versions")
      .select("version, content")
      .eq("id", page.published_version_id)
      .maybeSingle();
    publishedVersion = version?.version ?? null;
    publishedContent = version?.content ?? null;
  }

  return {
    ok: true,
    data: {
      draft: parseLandingConfig(page.draft_content),
      hasUnpublishedChanges: JSON.stringify(page.draft_content) !== JSON.stringify(publishedContent),
      publishedAt: page.published_at,
      publishedVersion,
      draftUpdatedAt: page.draft_updated_at,
    },
  };
}

export async function saveDraft(input: unknown, source: "manual" | "autosave"): Promise<ActionResult<{ savedAt: string }>> {
  const ctx = await guard("edit");
  if (typeof ctx === "string") return fail(ctx);

  const result = validateConfig(input);
  if ("error" in result) return fail(result.error);

  const savedAt = new Date().toISOString();
  const { data, error } = await ctx.supabase
    .from("landing_pages")
    .update({ draft_content: result.config, draft_updated_at: savedAt, draft_updated_by: ctx.session.userId })
    .eq("slug", LANDING_SLUG)
    .select("id");

  if (error || !data?.length) return fail("Não foi possível salvar as alterações.");

  // O autosave não gera ruído na auditoria; o salvamento manual sim.
  if (source === "manual") await audit(ctx, "landing_updated", "landing_page", data[0].id);

  return { ok: true, data: { savedAt } };
}

export async function publishLanding(input: unknown, note: string): Promise<ActionResult<{ version: number; publishedAt: string }>> {
  const ctx = await guard("publish");
  if (typeof ctx === "string") return fail(ctx);

  const saved = await saveDraft(input, "autosave");
  if (!saved.ok) return saved;

  const { data, error } = await ctx.supabase.rpc("publish_landing", { p_slug: LANDING_SLUG, p_note: note.trim() || null });
  if (error || !data) return fail("Não foi possível publicar a landing page.");

  refreshPublicSite();
  return { ok: true, data: { version: data.version, publishedAt: data.created_at } };
}

export async function discardDraft(): Promise<ActionResult<{ draft: LandingConfig }>> {
  const ctx = await guard("publish");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase.rpc("discard_landing_draft", { p_slug: LANDING_SLUG });
  if (error) return fail("Não foi possível descartar as alterações.");

  return { ok: true, data: { draft: parseLandingConfig(data) } };
}

// ---------- Histórico / rollback ----------
export async function listVersions(): Promise<ActionResult<VersionSummary[]>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  const { data: page } = await ctx.supabase.from("landing_pages").select("id, published_version_id").eq("slug", LANDING_SLUG).maybeSingle();
  if (!page) return { ok: true, data: [] };

  const { data, error } = await ctx.supabase
    .from("landing_versions")
    .select("id, version, status, note, restored_from_version, created_by_name, created_at")
    .eq("landing_page_id", page.id)
    .order("version", { ascending: false })
    .limit(60);
  if (error) return fail("Não foi possível carregar o histórico.");

  return {
    ok: true,
    data: data.map((row) => ({
      id: row.id,
      version: row.version,
      status: row.status,
      note: row.note,
      restoredFromVersion: row.restored_from_version,
      createdByName: row.created_by_name,
      createdAt: row.created_at,
      isCurrent: row.id === page.published_version_id,
    })),
  };
}

export async function getVersionContent(versionId: string): Promise<ActionResult<{ config: LandingConfig; version: number }>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase.from("landing_versions").select("version, content").eq("id", versionId).maybeSingle();
  if (error || !data) return fail("Versão não encontrada.");

  return { ok: true, data: { config: parseLandingConfig(data.content), version: data.version } };
}

export async function restoreVersion(versionId: string): Promise<ActionResult<{ version: number; publishedAt: string; draft: LandingConfig }>> {
  const ctx = await guard("publish");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase.rpc("restore_landing_version", { p_version_id: versionId });
  if (error || !data) return fail("Não foi possível restaurar esta versão.");

  refreshPublicSite();
  return { ok: true, data: { version: data.version, publishedAt: data.created_at, draft: parseLandingConfig(data.content) } };
}

// ---------- Mídia ----------
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const FOLDERS = ["hero", "sponsors", "partners", "gallery", "footer", "og", "miscellaneous", "blog-covers", "blog-content"] as const;
// A biblioteca é única; só o caminho no bucket separa os arquivos do Blog dos da landing.
const FOLDER_PATHS: Record<string, string> = { "blog-covers": "blog/covers", "blog-content": "blog/content" };
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
};

function toAsset(row: Record<string, unknown>): MediaAsset {
  return {
    id: String(row.id),
    name: String(row.name),
    path: String(row.path),
    url: String(row.url),
    folder: String(row.folder),
    mimeType: String(row.mime_type),
    size: Number(row.size),
    createdAt: String(row.created_at),
  };
}

/** Confere os primeiros bytes: a extensão e o Content-Type vêm do cliente e podem mentir. */
function matchesSignature(bytes: Uint8Array, mime: string): boolean {
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);

  if (mime === "image/jpeg") return starts(0xff, 0xd8, 0xff);
  if (mime === "image/png") return starts(0x89, 0x50, 0x4e, 0x47);
  if (mime === "image/webp") return starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45;
  return mime === "image/svg+xml";
}

export async function uploadAsset(formData: FormData): Promise<ActionResult<MediaAsset>> {
  const ctx = await guard("edit");
  if (typeof ctx === "string") return fail(ctx);

  const file = formData.get("file");
  const folderInput = String(formData.get("folder") ?? "miscellaneous");
  const folder = (FOLDERS as readonly string[]).includes(folderInput) ? folderInput : "miscellaneous";

  if (!(file instanceof File) || file.size === 0) return fail("Selecione um arquivo de imagem.");
  if (file.size > MAX_FILE_SIZE) return fail("A imagem deve ter no máximo 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXTENSION[extension];
  if (!mime) return fail("Formato não aceito. Use JPG, PNG, WEBP ou SVG.");
  if (file.type && file.type !== mime) return fail("O tipo do arquivo não corresponde à extensão.");

  let body: Uint8Array = new Uint8Array(await file.arrayBuffer());
  if (!matchesSignature(body, mime)) return fail("O arquivo não é uma imagem válida.");

  if (mime === "image/svg+xml") {
    const clean = sanitizeSvg(new TextDecoder().decode(body));
    if (!clean) return fail("Este SVG contém elementos não permitidos (scripts ou conteúdo externo).");
    body = new TextEncoder().encode(clean);
  }

  const baseName =
    file.name
      .replace(/\.[^.]+$/, "")
      .normalize("NFD")
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "imagem";
  const path = `${FOLDER_PATHS[folder] ?? `landing/${folder}`}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${baseName}.${extension}`;

  const upload = await ctx.supabase.storage.from(ASSETS_BUCKET).upload(path, body, { contentType: mime, cacheControl: "31536000" });
  if (upload.error) return fail("Não foi possível enviar a imagem.");

  const url = ctx.supabase.storage.from(ASSETS_BUCKET).getPublicUrl(path).data.publicUrl;
  const { data, error } = await ctx.supabase
    .from("landing_assets")
    .insert({ name: file.name.slice(0, 120), path, url, folder, mime_type: mime, size: body.byteLength, uploaded_by: ctx.session.userId })
    .select()
    .single();

  if (error || !data) {
    await ctx.supabase.storage.from(ASSETS_BUCKET).remove([path]);
    return fail("Não foi possível registrar a imagem na biblioteca.");
  }

  await audit(ctx, "asset_uploaded", "landing_asset", data.id, { folder, mime, size: body.byteLength });
  return { ok: true, data: toAsset(data) };
}

export async function listAssets(): Promise<ActionResult<MediaAsset[]>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase.from("landing_assets").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return fail("Não foi possível carregar a biblioteca de mídia.");

  return { ok: true, data: data.map(toAsset) };
}

export async function renameAsset(id: string, name: string): Promise<ActionResult<MediaAsset>> {
  const ctx = await guard("edit");
  if (typeof ctx === "string") return fail(ctx);

  const cleanName = name.trim().slice(0, 120);
  if (!cleanName) return fail("Informe um nome para a imagem.");

  const { data, error } = await ctx.supabase.from("landing_assets").update({ name: cleanName }).eq("id", id).select().single();
  if (error || !data) return fail("Não foi possível renomear a imagem.");

  return { ok: true, data: toAsset(data) };
}

export async function deleteAsset(id: string): Promise<ActionResult<{ id: string }>> {
  const ctx = await guard("edit");
  if (typeof ctx === "string") return fail(ctx);

  const { data: asset } = await ctx.supabase.from("landing_assets").select("id, path, url").eq("id", id).maybeSingle();
  if (!asset) return fail("Imagem não encontrada.");

  // Não deixa apagar o que está em uso no rascunho salvo ou na versão publicada.
  const { data: page } = await ctx.supabase
    .from("landing_pages")
    .select("draft_content, published_version_id")
    .eq("slug", LANDING_SLUG)
    .maybeSingle();

  let inUse = JSON.stringify(page?.draft_content ?? {}).includes(asset.url);
  if (!inUse && page?.published_version_id) {
    const { data: version } = await ctx.supabase.from("landing_versions").select("content").eq("id", page.published_version_id).maybeSingle();
    inUse = JSON.stringify(version?.content ?? {}).includes(asset.url);
  }
  if (inUse) return fail("Esta imagem está em uso na landing page. Troque-a na seção correspondente antes de excluir.");

  const blogUsage = await ctx.supabase.rpc("blog_asset_in_use", { p_url: asset.url });
  // PGRST202 = função inexistente (migration do Blog ainda não aplicada): não há publicações para conferir.
  if (blogUsage.error && blogUsage.error.code !== "PGRST202") return fail("Não foi possível verificar se a imagem está em uso no Blog.");
  if (blogUsage.data) return fail("Esta imagem está em uso em uma publicação do Blog. Troque-a na publicação antes de excluir.");

  const removal = await ctx.supabase.storage.from(ASSETS_BUCKET).remove([asset.path]);
  if (removal.error) return fail("Não foi possível excluir a imagem.");

  const { error } = await ctx.supabase.from("landing_assets").delete().eq("id", id);
  if (error) return fail("Não foi possível excluir a imagem.");

  await audit(ctx, "asset_deleted", "landing_asset", id);
  return { ok: true, data: { id } };
}

// ---------- Auditoria de itens e consultas do painel ----------
const ITEM_ACTIONS = ["sponsor_created", "sponsor_deleted", "faq_created", "faq_deleted", "section_reset", "landing_reset"] as const;

export async function logItemAction(action: (typeof ITEM_ACTIONS)[number], label: string): Promise<void> {
  const ctx = await guard("edit");
  if (typeof ctx === "string" || !ITEM_ACTIONS.includes(action)) return;
  await audit(ctx, action, "landing_page", LANDING_SLUG, { label: label.slice(0, 120) });
}

export async function listAuditLogs(): Promise<ActionResult<AuditEntry[]>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase
    .from("landing_audit_logs")
    .select("id, action, entity_type, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return fail("Não foi possível carregar a auditoria.");

  return {
    ok: true,
    data: data.map((row) => ({ id: row.id, action: row.action, entityType: row.entity_type, metadata: row.metadata ?? {}, createdAt: row.created_at })),
  };
}

export async function listContactMessages(): Promise<ActionResult<ContactMessage[]>> {
  const ctx = await guard("view");
  if (typeof ctx === "string") return fail(ctx);

  const { data, error } = await ctx.supabase
    .from("contact_submissions")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) return fail("Não foi possível carregar as mensagens.");

  return { ok: true, data: data.map((row) => ({ id: row.id, name: row.name, email: row.email, message: row.message, createdAt: row.created_at })) };
}
