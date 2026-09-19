import { type AdminSession, getAdminSession } from "@/lib/landing/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export type Guard = { session: AdminSession; supabase: Awaited<ReturnType<typeof createSessionClient>> };

export const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

/**
 * Toda action revalida sessão e role no servidor. Mesmo que alguém burle esta checagem,
 * o RLS do banco/Storage bloqueia a escrita — as duas camadas são independentes.
 */
export async function guard(level: "view" | "edit" | "publish"): Promise<Guard | string> {
  if (!isSupabaseConfigured) return "O Supabase ainda não foi configurado neste ambiente.";

  const session = await getAdminSession();
  if (!session) return "Sua sessão expirou. Entre novamente.";

  const allowed =
    level === "publish" ? session.canPublish : level === "edit" ? session.canEdit : session.role !== "user";
  if (!allowed) return "Você não tem permissão para realizar esta ação.";

  return { session, supabase: await createSessionClient() };
}

export async function audit(
  { session, supabase }: Guard,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, string | number | boolean | null> = {},
) {
  // Nunca registrar senhas, tokens ou o conteúdo de mensagens: só o "quem, o quê, quando".
  const { error } = await supabase
    .from("landing_audit_logs")
    .insert({ user_id: session.userId, action, entity_type: entityType, entity_id: entityId, metadata });
  if (error) console.error("[admin] Falha ao registrar auditoria:", error.message);
}
