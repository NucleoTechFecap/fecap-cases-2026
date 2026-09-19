import type { Metadata } from "next";
import { PreviewClient } from "@/components/admin/landing/PreviewClient";
import { requirePanelAccess } from "@/lib/landing/auth";
// O preview também renderiza a página de Programação.
import "@/app/programacao/programacao.css";

export const metadata: Metadata = { title: "Preview | FECAP Cases", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// O rascunho só chega aqui por postMessage vindo do editor; ainda assim a rota exige acesso ao painel.
export default async function LandingPreviewPage() {
  await requirePanelAccess();
  return <PreviewClient />;
}
