import { useId } from "react";
import { useTogglePostReaction } from "../../data/hooks";
import type { Member, Post } from "../../data/types";
import { CommentThread } from "./CommentThread";
import { ReactionRow } from "./ReactionRow";
import styles from "./PostDiscussion.module.css";

export interface PostDiscussionProps {
  post: Post;
  me: Member;
}

/** Reactions and the comment thread at the foot of a detail page. */
export function PostDiscussion({ post, me }: PostDiscussionProps) {
  const react = useTogglePostReaction();
  const headingId = useId();
  return (
    <>
      <ReactionRow
        reactions={post.reactions}
        viewerId={me.id}
        size={30}
        onToggle={(emoji) => react.mutate({ postId: post.id, memberId: me.id, emoji })}
      />
      <section className={styles.comments} aria-labelledby={headingId}>
        <h2 id={headingId} className={styles.title}>
          Comments <span className={styles.count}>{post.commentCount}</span>
        </h2>
        <CommentThread postId={post.id} />
      </section>
    </>
  );
}
