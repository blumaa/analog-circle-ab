import { useState } from "react";
import type { Post } from "../../data/types";
import { PostCard } from "../posts/PostCard";
import { EmptyState } from "../../components/EmptyState";
import styles from "./PostList.module.css";

export interface PostListProps {
  posts: Post[];
  emptyText?: string;
}

/** Post cards; one comment thread open at a time. */
export function PostList({ posts, emptyText = "No posts match." }: PostListProps) {
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  if (posts.length === 0) return <EmptyState>{emptyText}</EmptyState>;
  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          expanded={expandedPostId === post.id}
          onToggleComments={() => setExpandedPostId((id) => (id === post.id ? null : post.id))}
        />
      ))}
    </div>
  );
}
