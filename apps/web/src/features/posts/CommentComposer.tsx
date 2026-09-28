import { useState, type FormEvent } from "react";
import { SendHorizontal, X } from "lucide-react";
import { Avatar } from "@analog/ui";
import type { Member } from "../../data/types";
import styles from "./CommentComposer.module.css";

export interface CommentComposerProps {
  me: Member;
  /** Name of the person being replied to, if any. */
  replyingTo?: string | null;
  onCancelReply?: () => void;
  onSend: (body: string) => void;
}

export function CommentComposer({ me, replyingTo, onCancelReply, onSend }: CommentComposerProps) {
  const [body, setBody] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    onSend(text);
    setBody("");
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      {replyingTo && (
        <p className={styles.replying}>
          Replying to {replyingTo}
          <button type="button" className={styles.cancel} aria-label="Cancel reply" onClick={onCancelReply}>
            <X size={12} aria-hidden="true" />
          </button>
        </p>
      )}
      <div className={styles.row}>
        <Avatar name={me.name} src={me.photoUrl} size={26} decorative />
        <div className={styles.field}>
          <input
            className={styles.input}
            aria-label={replyingTo ? `Reply to ${replyingTo}` : "Write a comment"}
            placeholder={replyingTo ? "Write a reply…" : "Write a comment…"}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button type="submit" className={styles.send} aria-label="Send" disabled={!body.trim()}>
            <SendHorizontal size={13} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}
