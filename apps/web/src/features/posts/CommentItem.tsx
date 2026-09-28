import { useState, type FormEvent } from "react";
import { Avatar } from "@analog/ui";
import type { Comment, Member } from "../../data/types";
import { firstName } from "../../lib/names";
import { canDeleteComment, canEditComment } from "../../lib/permissions";
import { reactionSummary } from "../../lib/reactions";
import { relativeTime } from "../../lib/relativeTime";
import { EmojiPicker } from "./EmojiPicker";
import { ReactionRow } from "./ReactionRow";
import styles from "./CommentItem.module.css";

export interface CommentItemProps {
  comment: Comment;
  author: Member | undefined;
  me: Member;
  isReply: boolean;
  /** Birthday cards: one-line "Name text" style. */
  compact: boolean;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: (body: string) => void;
  onDelete: () => void;
}

export function CommentItem({ comment, author, me, isReply, compact, onReact, onReply, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [picking, setPicking] = useState(false);
  const name = author ? firstName(author.name) : "Former member";

  const save = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (text && text !== comment.body) onEdit(text);
    setEditing(false);
  };

  const actions = (
    <>
      <button type="button" className={styles.link} onClick={onReply}>
        Reply
      </button>
      {canEditComment(comment, me) && (
        <button type="button" className={styles.link} onClick={() => { setDraft(comment.body); setEditing(true); }}>
          Edit
        </button>
      )}
      {canDeleteComment(comment, me) && (
        <button type="button" className={styles.link} onClick={onDelete}>
          Delete
        </button>
      )}
    </>
  );

  const body = editing ? (
    <form className={styles.editForm} onSubmit={save}>
      <input className={styles.editInput} aria-label="Edit comment" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
      <button type="submit" className={styles.link}>Save</button>
      <button type="button" className={styles.link} onClick={() => setEditing(false)}>Cancel</button>
    </form>
  ) : (
    <p className={styles.text}>{comment.body}</p>
  );

  if (compact) {
    const summary = reactionSummary(comment.reactions, me.id);
    const mine = new Set(summary.filter((r) => r.mine).map((r) => r.emoji));
    return (
      <li className={styles.compact} data-reply={isReply || undefined}>
        <Avatar name={author?.name ?? name} src={author?.photoUrl} size={isReply ? 22 : 26} decorative />
        <div className={styles.compactBody}>
          {editing ? body : <p className={styles.text}><strong className={styles.name}>{name}</strong> {comment.body}</p>}
          <div className={styles.meta}>
            {summary.map((r) => `${r.emoji} ${r.count}`).join(" · ")}
            <button type="button" className={styles.link} aria-expanded={picking} onClick={() => setPicking((p) => !p)}>
              React
            </button>
            {actions}
          </div>
          {picking && <EmojiPicker mine={mine} onPick={(e) => { onReact(e); setPicking(false); }} />}
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item} data-reply={isReply || undefined}>
      <Avatar name={author?.name ?? name} src={author?.photoUrl} size={isReply ? 22 : 26} decorative />
      <div className={styles.main}>
        <div className={styles.bubble}>
          <div className={styles.head}>
            <span className={styles.name}>{name}</span>
            <span className={styles.time}>
              {relativeTime(comment.createdAt)}
              {comment.updatedAt && " · edited"}
            </span>
          </div>
          {body}
        </div>
        <ReactionRow reactions={comment.reactions} viewerId={me.id} onToggle={onReact}>
          {actions}
        </ReactionRow>
      </div>
    </li>
  );
}
