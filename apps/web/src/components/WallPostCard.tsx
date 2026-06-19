import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, Badge, Button, Tooltip } from "@analog/ui";
import { Heart, Trash2 } from "lucide-react";
import { relativeTime } from "../lib/relativeTime";
import styles from "./WallPostCard.module.css";

export interface WallPostCardReply {
  author: string;
  body: string;
  timestamp: string;
}

export interface WallPostCardProps {
  author: { name: string; photoUrl?: string | null };
  /** ISO timestamp; rendered as relative time. */
  timestamp: string;
  /** Post body: text, image, or an activity sentence for activity-mode cards. */
  children: ReactNode;
  /** When "inner", renders an Inner badge. */
  scope?: "analog" | "inner";
  /** Omit entirely to hide the heart section (e.g. activity-mode cards). */
  likes?: {
    count: number;
    likerNames: string[];
    hasLiked: boolean;
    onToggle?: () => void;
  };
  /** Omit entirely to hide the replies section (e.g. activity-mode cards). */
  replies?: {
    items: WallPostCardReply[];
    canReply?: boolean;
    onReply?: (body: string) => void;
  };
  /** When provided, renders a ghost delete affordance. */
  onDelete?: () => void;
  /** When provided, the card body links to this route (e.g. an activity's target). */
  href?: string;
}

export function WallPostCard({
  author,
  timestamp,
  children,
  scope,
  likes,
  replies,
  onDelete,
  href,
}: WallPostCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.authorRow}>
          <Avatar src={author.photoUrl} name={author.name} size="sm" />
          <div>
            <span className={styles.authorName}>{author.name}</span>
            <span className={styles.timestamp}>{relativeTime(timestamp)}</span>
          </div>
        </div>

        <div className={styles.metaRow}>
          {scope === "inner" && <Badge variant="neutral">Inner</Badge>}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={onDelete}
              aria-label="Delete post"
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {href ? (
        <Link to={href} className={styles.bodyLink}>
          <div className={styles.body}>{children}</div>
        </Link>
      ) : (
        <div className={styles.body}>{children}</div>
      )}

      {likes !== undefined && <LikeBar likes={likes} />}

      {replies !== undefined && <RepliesSection replies={replies} />}
    </article>
  );
}

// ── Private sub-components ────────────────────────────────────────────────────

interface LikeBarProps {
  likes: NonNullable<WallPostCardProps["likes"]>;
}

function LikeBar({ likes }: LikeBarProps) {
  const { count, likerNames, hasLiked, onToggle } = likes;

  const heartButton = (
    <div className={styles.likes}>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        onClick={onToggle}
        disabled={!onToggle}
        aria-label={hasLiked ? "Unlike" : "Like"}
        aria-pressed={hasLiked}
      >
        <Heart
          size={16}
          className={hasLiked ? styles.heartActive : undefined}
          fill={hasLiked ? "currentColor" : "none"}
        />
      </Button>
      <span className={styles.likeCount}>{count}</span>
    </div>
  );

  return (
    <div className={styles.likeBar}>
      {count > 0 ? (
        <Tooltip content={`Liked by ${likerNames.join(", ")}`}>{heartButton}</Tooltip>
      ) : (
        heartButton
      )}
    </div>
  );
}

interface RepliesSectionProps {
  replies: NonNullable<WallPostCardProps["replies"]>;
}

function RepliesSection({ replies }: RepliesSectionProps) {
  const { items, canReply = false, onReply } = replies;
  const [expanded, setExpanded] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  function handleSubmit() {
    const trimmed = replyBody.trim();
    if (!trimmed || !onReply) return;
    onReply(trimmed);
    setReplyBody("");
  }

  const hasItems = items.length > 0;

  return (
    <div className={styles.repliesSection}>
      {hasItems && (
        <button
          type="button"
          className={styles.replyToggle}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded
            ? "Hide replies"
            : `${items.length} ${items.length === 1 ? "reply" : "replies"}`}
        </button>
      )}

      {expanded && (
        <ul className={styles.replyList} aria-label="Replies">
          {items.map((reply, i) => (
            <li key={i} className={styles.replyItem}>
              <div className={styles.replyMeta}>
                <span className={styles.replyAuthor}>{reply.author}</span>
                <span className={styles.replyTime}>{relativeTime(reply.timestamp)}</span>
              </div>
              <p className={styles.replyBody}>{reply.body}</p>
            </li>
          ))}
        </ul>
      )}

      {canReply && (
        <div className={styles.replyComposer}>
          <textarea
            className={styles.replyTextarea}
            aria-label="Reply body"
            placeholder="Write a reply…"
            rows={2}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
          />
          <div className={styles.replyActions}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!replyBody.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
