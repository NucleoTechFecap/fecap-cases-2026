import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FeedbackProvider } from "@/components/admin/ui/Feedback";
import { ROLE_LABELS, requirePanelAccess } from "@/lib/landing/auth";
import "../admin.css";
import "../blog-admin.css";

export const metadata: Metadata = { title: "Admin | FECAP Cases", robots: { index: false, follow: false } };

// A role é conferida no servidor a cada requisição (e de novo em cada action e no RLS).
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePanelAccess();

  return (
    <FeedbackProvider>
      <div className="adm-shell">
        <AdminHeader name={session.name} roleLabel={ROLE_LABELS[session.role]} />
        <div className="adm-main">{children}</div>
      </div>
    </FeedbackProvider>
  );
}
