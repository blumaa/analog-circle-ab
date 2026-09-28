import { useState } from "react";
import {
  useAddComment,
  useComments,
  useDeleteComment,
  useMe,
  useMembers,
  useToggleCommentReaction,
  useUpdateComment,
} from "../../data/hooks";
import type { Comment } from "../../data/types";
import { ConfirmSheet } from "../../components/ConfirmSheet";
import { firstName } from "../../lib/names";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import styles from "./CommentThread.module.css";

export interface CommentThreadProps {
  postId: string;
  /** Birthday cards use the one-line style. */
  compact?: boolean;
}

/** Comments with one level of replies, reactions, edit and delete, and a composer. */
export function CommentThread({ postId, compact = false }: CommentThreadProps) {
  const { me } = useMe();
  const { data: comments = [], isLoading } = useComments(postId);
  const { data: members = [] } = useMembers();
  const add = useAddComment();
  const update = useUpdateComment();
  const remove = useDeleteComment();
  const react = useToggleCommentReaction();
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [deleting, setDeleting] = useState<Comment | null>(null);
  if (!me) return null;

  const memberById = new Map(members.map((m) => [m.id, m]));
  const topLevel = comments.filter((c) => c.parentId === null);
  const repliesTo = (id: string) => comments.filter((c) => c.parentId === id);
  const replyName = replyTo ? firstName(memberById.get(replyTo.authorId)?.name ?? "Former member") : null;

  const renderItem = (c: Comment) => (
    <CommentItem
      key={c.id}
      comment={c}
      author={memberById.get(c.authorId)}
      me={me}
      isReply={c.parentId !== null}
      compact={compact}
      onReact={(emoji) => react.mutate({ commentId: c.id, postId, memberId: me.id, emoji })}
      onReply={() => setReplyTo(c)}
      onEdit={(body) => update.mutate({ id: c.id, postId, body })}
      onDelete={() => setDeleting(c)}
    />
  );

  return (
    <section className={styles.thread} aria-label="Comments">
      {!isLoading && topLevel.length === 0 && <p className={styles.empty}>No comments yet. Say something nice.</p>}
      <ul className={styles.list}>
        {topLevel.map((c) => [renderItem(c), ...repliesTo(c.id).map(renderItem)])}
      </ul>
      <CommentComposer
        me={me}
        replyingTo={replyName}
        onCancelReply={() => setReplyTo(null)}
        onSend={(body) => {
          add.mutate({ postId, authorId: me.id, body, parentId: replyTo?.id ?? null });
          setReplyTo(null);
        }}
      />
      <ConfirmSheet
        open={deleting !== null}
        title="Delete comment?"
        confirmLabel="Delete comment"
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate({ id: deleting.id, postId });
          setDeleting(null);
        }}
      >
        {deleting?.parentId === null && repliesTo(deleting.id).length > 0
          ? "Its replies will be deleted too."
          : "This can't be undone."}
      </ConfirmSheet>
    </section>
  );
}
