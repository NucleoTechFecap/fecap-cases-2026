import { BlogCard } from "@/components/blog/BlogCard";
import type { PostCard } from "@/lib/blog/types";

export function BlogGrid({ posts, headingLevel = "h3" }: { posts: PostCard[]; headingLevel?: "h2" | "h3" }) {
  return (
    <div className="blog-grid" data-reveal-group>
      {posts.map((post) => (
        <BlogCard post={post} headingLevel={headingLevel} key={post.id} />
      ))}
    </div>
  );
}
