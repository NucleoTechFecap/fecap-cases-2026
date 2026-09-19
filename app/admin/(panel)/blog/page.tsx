import { listCategories, listPosts } from "@/app/admin/blog/actions";
import { BlogDashboard } from "@/components/admin/blog/BlogDashboard";
import { requirePanelAccess } from "@/lib/landing/auth";
import { BlogErrorState } from "./ErrorState";

export const dynamic = "force-dynamic";

export default async function BlogAdminPage() {
  const session = await requirePanelAccess();
  const [posts, categories] = await Promise.all([listPosts(), listCategories()]);

  if (!posts.ok) return <BlogErrorState title="Blog" message={posts.error} />;

  return <BlogDashboard initial={posts.data} categories={categories.ok ? categories.data : []} canEdit={session.canEdit} canPublish={session.canPublish} />;
}
