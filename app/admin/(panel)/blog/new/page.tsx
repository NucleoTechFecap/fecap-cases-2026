import { redirect } from "next/navigation";
import { listCategories, listTags } from "@/app/admin/blog/actions";
import { PostEditor } from "@/components/admin/blog/PostEditor";
import { requirePanelAccess } from "@/lib/landing/auth";
import "@/app/blog/blog.css";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const session = await requirePanelAccess();
  if (!session.canEdit) redirect("/admin/blog");

  const [categories, tags] = await Promise.all([listCategories(), listTags()]);

  return (
    <PostEditor
      initial={null}
      categories={categories.ok ? categories.data : []}
      tags={tags.ok ? tags.data : []}
      authorName={session.name}
      canEdit={session.canEdit}
      canPublish={session.canPublish}
    />
  );
}
