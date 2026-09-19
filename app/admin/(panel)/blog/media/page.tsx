import { MediaLibrary } from "@/components/admin/landing/MediaLibrary";
import { requirePanelAccess } from "@/lib/landing/auth";

export const dynamic = "force-dynamic";

// A biblioteca é a MESMA da landing (tabela landing_assets + bucket landing-assets): nada duplicado.
export default async function BlogMediaPage() {
  const session = await requirePanelAccess();

  return (
    <>
      <header className="adm-topbar">
        <div className="adm-topbar-title">
          <h1>Mídia</h1>
          <p>Biblioteca compartilhada entre o Blog e a Landing Page. Imagens em uso não podem ser excluídas.</p>
        </div>
      </header>
      <div className="adm-page">
        <section className="adm-card">
          <MediaLibrary canEdit={session.canEdit} folder="blog-content" />
        </section>
      </div>
    </>
  );
}
