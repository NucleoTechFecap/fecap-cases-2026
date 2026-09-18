import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSessionClient } from "@/lib/supabase/server";

export type AppRole = "super_admin" | "admin" | "editor" | "viewer" | "user";

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  role: AppRole;
  canEdit: boolean;
  canPublish: boolean;
};

const PANEL_ROLES: AppRole[] = ["super_admin", "admin", "editor", "viewer"];
const EDIT_ROLES: AppRole[] = ["super_admin", "admin", "editor"];
const PUBLISH_ROLES: AppRole[] = ["super_admin", "admin"];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super admin",
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
  user: "Usuário",
};

/** Lê a role direto do banco (nunca de cookie, e-mail ou metadado editável pelo usuário). */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  const role = (profile?.role ?? "user") as AppRole;

  return {
    userId: user.id,
    email: user.email ?? "",
    name: profile?.full_name ?? user.email ?? "Usuário",
    role,
    canEdit: EDIT_ROLES.includes(role),
    canPublish: PUBLISH_ROLES.includes(role),
  };
}

/** Para páginas: redireciona quem não pode ver o painel. */
export async function requirePanelAccess(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!PANEL_ROLES.includes(session.role)) redirect("/admin/login?erro=sem-acesso");
  return session;
}
