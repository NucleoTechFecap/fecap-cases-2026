import { listTags } from "@/app/admin/blog/actions";
import { TagManager } from "@/components/admin/blog/TagManager";
import { requirePanelAccess } from "@/lib/landing/auth";
import { BlogErrorState } from "../ErrorState";

export const dynamic = "force-dynamic";

export default async function BlogTagsPage() {
  const session = await requirePanelAccess();
  const tags = await listTags();
  if (!tags.ok) return <BlogErrorState title="Tags" message={tags.error} />;

  return <TagManager initial={tags.data} canEdit={session.canEdit} canDelete={session.canPublish} />;
}
