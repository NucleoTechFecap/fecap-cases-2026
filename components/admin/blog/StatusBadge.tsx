import { type PostStatus, STATUS_LABELS } from "@/lib/blog/types";

export function StatusBadge({ status }: { status: PostStatus }) {
  return (
    <span className="adm-badge adm-blog-status" data-status={status}>
      {STATUS_LABELS[status]}
    </span>
  );
}
