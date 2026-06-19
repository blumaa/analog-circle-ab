import type { LoopPost } from "../../data";

export type KindFilter = "all" | "need" | "offer" | "archived" | "mine";

export interface FilterParams {
  query: string;
  kind: KindFilter;
  category: string;
  /** Required for the "mine" filter — the signed-in member's id. */
  currentMemberId?: string | null;
}

export function filterLoopPosts(
  posts: LoopPost[],
  { query, kind, category, currentMemberId }: FilterParams,
  resolveAuthorName: (authorId: string) => string,
): LoopPost[] {
  return posts.filter((post) => {
    // Archival filter
    if (kind === "archived") {
      if (!post.archived) return false;
    } else {
      if (post.archived) return false;
      if (kind === "mine") {
        if (!currentMemberId || post.authorId !== currentMemberId) return false;
      } else if (kind !== "all") {
        if (post.kind !== kind) return false;
      }
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
