import type { LoopPost } from "../../data";

export type KindFilter = "all" | "need" | "offer" | "archived";

export interface FilterParams {
  query: string;
  kind: KindFilter;
  category: string;
}

export function filterLoopPosts(
  posts: LoopPost[],
  { query, kind, category }: FilterParams,
  resolveAuthorName: (authorId: string) => string,
): LoopPost[] {
  return posts.filter((post) => {
    // Archival filter
    if (kind === "archived") {
      if (!post.archived) return false;
    } else {
      if (post.archived) return false;
      if (kind !== "all" && post.kind !== kind) return false;
    }

    // Category filter
    if (category !== "all categories" && post.category !== category) return false;

    // Query filter
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      const authorName = resolveAuthorName(post.authorId).toLowerCase();
      if (
        !post.body.toLowerCase().includes(q) &&
        !post.category.toLowerCase().includes(q) &&
        !authorName.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });
}
