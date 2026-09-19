import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/blog/ArticleView";
import { DETAIL_SELECT, toPostDetail } from "@/lib/blog/mappers";
import { STATUS_LABELS, effectiveStatus } from "@/lib/blog/types";
import { requirePanelAccess } from "@/lib/landing/auth";
import { createSessionClient } from "@/lib/supabase/server";
import "@/app/blog/blog.css";

export const metadata: Metadata = { title: "Preview da publicação | FECAP Cases", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Preview protegido: exige acesso ao painel e lê com a sessão do usuário (RLS).
// Renderiza o MESMO <ArticleView> da página pública, a partir do que está salvo no banco.
export default async function BlogPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePanelAccess();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createSessionClient();
  const { data } = await supabase.from("blog_posts").select(DETAIL_SELECT).eq("id", id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();

  const post = toPostDetail(data);
  const status = effectiveStatus(post.status, post.publishedAt);

  return (
    <ArticleView
      post={post}
      related={[]}
      shareUrl=""
      notice={
        <p className="blog-preview-notice" role="status">
          <strong>Preview</strong> · {STATUS_LABELS[status]} · visível apenas para quem tem acesso ao painel.
          {status !== "published" && " Esta publicação ainda não está no ar."}
        </p>
      }
    />
  );
}
