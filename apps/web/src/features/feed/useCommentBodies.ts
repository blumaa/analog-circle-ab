import { useMemo } from "react";
import { useAllComments } from "../../data/hooks";

/** Comment text per post, for search. Loads comments only while enabled. */
export function useCommentBodies(enabled: boolean): (postId: string) => string[] {
  const { data: comments } = useAllComments(enabled);
  return useMemo(() => {
    const byPost = new Map<string, string[]>();
    for (const c of comments ?? []) byPost.set(c.postId, [...(byPost.get(c.postId) ?? []), c.body]);
    return (postId: string) => byPost.get(postId) ?? [];
  }, [comments]);
}
