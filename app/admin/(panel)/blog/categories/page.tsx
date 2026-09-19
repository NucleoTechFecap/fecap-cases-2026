import { listCategories } from "@/app/admin/blog/actions";
import { CategoryManager } from "@/components/admin/blog/CategoryManager";
import { requirePanelAccess } from "@/lib/landing/auth";
import { BlogErrorState } from "../ErrorState";

export const dynamic = "force-dynamic";

export default async function BlogCategoriesPage() {
  const session = await requirePanelAccess();
  const categories = await listCategories();
  if (!categories.ok) return <BlogErrorState title="Categorias" message={categories.error} />;

  return <CategoryManager initial={categories.data} canEdit={session.canEdit} canDelete={session.canPublish} />;
}
