import { loadEditorData } from "@/app/admin/actions";
import { LandingEditor } from "@/components/admin/landing/LandingEditor";
import { requirePanelAccess } from "@/lib/landing/auth";

export const dynamic = "force-dynamic";

export default async function LandingAdminPage() {
  const session = await requirePanelAccess();
  const result = await loadEditorData();

  if (!result.ok) {
    return (
      <div className="adm-error-page">
        <h1>Landing Page</h1>
        <p>{result.error}</p>
      </div>
    );
  }

  return <LandingEditor initial={result.data} canEdit={session.canEdit} canPublish={session.canPublish} />;
}
