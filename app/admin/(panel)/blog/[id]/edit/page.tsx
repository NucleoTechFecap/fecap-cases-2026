import { getPostForEdit, listCategories, listTags } from "@/app/admin/blog/actions";
import { PostEditor } from "@/components/admin/blog/PostEditor";
import { requirePanelAccess } from "@/lib/landing/auth";
import "@/app/blog/blog.css";
import { BlogErrorState } from "../../ErrorState";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePanelAccess();
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([getPostForEdit(id), listCategories(), listTags()]);

  if (!post.ok) return <BlogErrorState title="Publicação" message={post.error} />;

  // Editor (sem permissão de publicar) só altera rascunhos — o RLS aplica a mesma regra.
  const canEdit = session.canEdit && (session.canPublish || post.data.status === "draft");

  return (
    <PostEditor
      key={post.data.id}
      initial={post.data}
      categories={categories.ok ? categories.data : []}
      tags={tags.ok ? tags.data : []}
      authorName={session.name}
      canEdit={canEdit}
      canPublish={session.canPublish}
    />
  );
}
