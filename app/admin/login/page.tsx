import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/landing/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "../admin.css";

export const metadata: Metadata = { title: "Entrar | FECAP Cases Admin", robots: { index: false, follow: false } };

type LoginPageProps = { searchParams: Promise<{ next?: string; erro?: string }> };

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next = "", erro } = await searchParams;

  const session = await getAdminSession();
  if (session && session.role !== "user") redirect("/admin");

  return (
    <main className="adm-login">
      <img className="adm-login-logo" src="/fecap-cases-logo.png" alt="direções — FECAP Cases 2026" width={711} height={355} />
      <div className="adm-login-card">
        <p className="adm-eyebrow">Painel da organização</p>
        <h1>
          FECAP Cases <span>Admin</span>
        </h1>
        <p>Acesso restrito à equipe organizadora.</p>

        {!isSupabaseConfigured && <p className="adm-banner">Configure as variáveis do Supabase (.env.local) para habilitar o painel.</p>}
        {erro === "sem-acesso" && <p className="adm-banner">Sua conta não tem permissão para acessar o painel.</p>}

        <LoginForm next={next} />
        <a href="/">← Voltar para o site</a>
      </div>
    </main>
  );
}
