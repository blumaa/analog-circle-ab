import { useState } from "react";
import { Badge, Button, Card, CardBody, Textarea } from "@analog/ui";
import type { LoopPost } from "../data";
import styles from "./PostCard.module.css";

export interface PostCardProps {
  post: LoopPost;
  authorName: string;
  authorWhatsappUrl?: string | null;
  canArchive: boolean;
  onArchive: () => void;
  /** Resolve a member id to a display name. */
  resolveName?: (memberId: string) => string;
  /** The signed-in member id — required for the "I can help" composer. */
  currentMemberId?: string | null;
  /** Called when the user submits a help note. */
  onAddNote?: (postId: string, authorId: string, body: string) => void;
}

export function PostCard({
  post,
  authorName,
  authorWhatsappUrl = null,
  canArchive,
  onArchive,
  resolveName,
  currentMemberId = null,
  onAddNote,
}: PostCardProps) {
  const whatsappLabel = `Whatsapp ${authorName}`;
  const [composerOpen, setComposerOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");

  function handleNoteSubmit() {
    if (!noteBody.trim() || !currentMemberId || !onAddNote) return;
    onAddNote(post.id, currentMemberId, noteBody.trim());
    setNoteBody("");
    setComposerOpen(false);
  }

  function handleNoteCancel() {
    setNoteBody("");
    setComposerOpen(false);
  }

  const helpedByNames =
    post.helpedBy.length > 0 && resolveName
      ? post.helpedBy.map(resolveName).join(", ")
      : null;

  return (
    <Card as="article" data-kind={post.kind} className={styles.postCard}>
      <CardBody>
        <div className={styles.content}>
          <div className={styles.topRow}>
          <Badge variant={post.kind === "need" ? "rose" : "accent"}>{post.kind === "need" ? "NEED" : "OFFER"}</Badge>
            {post.category && (
              <span className={styles.category}>{post.category}</span>
            )}
          </div>

          <p className={styles.body}>{post.body}</p>

          {/* Notes from helpers */}
          {post.notes.length > 0 && (
            <ul className={styles.noteList} aria-label="Helper notes">
              {post.notes.map((note, i) => (
                <li key={i} className={styles.noteItem}>
                  <span className={styles.noteAuthor}>
                    NOTE FROM {resolveName ? resolveName(note.authorId).toUpperCase() : note.authorId.toUpperCase()}
                  </span>
                  <p className={styles.noteBody}>{note.body}</p>
                </li>
              ))}
            </ul>
          )}

          {/* Helped by credits */}
          {helpedByNames && (
            <p className={styles.helpedBy}>Helped by {helpedByNames}</p>
          )}

          <div className={styles.footer}>
            <div className={styles.authorRow}>
              <span className={styles.author}>{authorName}</span>
              {authorWhatsappUrl && (
                <a
                  href={authorWhatsappUrl}
                  className={styles.whatsapp}
                  aria-label={whatsappLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WHATSAPP
                </a>
              )}
            </div>
            <div className={styles.actions}>
              {post.kind === "need" && !composerOpen && (
                <Button variant="outline" size="sm" onClick={() => setComposerOpen(true)}>
                  I can help
                </Button>
              )}
              {canArchive && (
                <Button variant="ghost" size="sm" onClick={onArchive} className={styles.archiveBtn}>
                  Archive
                </Button>
              )}
            </div>
          </div>

          {/* Inline note composer */}
          {composerOpen && (
            <div className={styles.noteComposer} role="form" aria-label="Add a help note">
              <Textarea
                aria-label="Help note"
                placeholder="Share how you can help…"
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                rows={3}
              />
              <div className={styles.noteActions}>
                <Button variant="ghost" size="sm" onClick={handleNoteCancel}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNoteSubmit}
                  disabled={!noteBody.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
