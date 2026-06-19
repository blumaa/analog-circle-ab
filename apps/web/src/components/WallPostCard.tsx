import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Accordion, Avatar, Badge, Button, Card, CardBody, Tooltip } from "@analog/ui";
import { MentionTextarea, type Mentionable } from "@analog/ui";
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
    onReply?: (body: string, mentions: string[]) => void;
  };
  /** Members available for @mention in the reply composer. */
  mentionables?: Mentionable[];
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
  mentionables = [],
  onDelete,
  href,
}: WallPostCardProps) {
  return (
    <Card>
      <CardBody padding="none">
        <div className={styles.inner}>
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
        </div>

        {replies !== undefined && (
          <RepliesSection
            replies={replies}
            mentionables={mentionables}
          />
        )}
      </CardBody>
    </Card>
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
  mentionables: Mentionable[];
}

function RepliesSection({ replies, mentionables }: RepliesSectionProps) {
  const { items, canReply = false, onReply } = replies;
  const [replyBody, setReplyBody] = useState("");
  const [replyMentions, setReplyMentions] = useState<string[]>([]);

  function handleSubmit() {
    const trimmed = replyBody.trim();
    if (!trimmed || !onReply) return;
    onReply(trimmed, replyMentions);
    setReplyBody("");
    setReplyMentions([]);
  }

  const hasItems = items.length > 0;
  const summaryText = hasItems
    ? `${items.length} ${items.length === 1 ? "reply" : "replies"}`
    : "Reply";

  const replyList = hasItems ? (
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
  ) : null;

  const composer = canReply ? (
    <div className={styles.replyComposer}>
      <MentionTextarea
        value={replyBody}
        onChange={setReplyBody}
        mentionables={mentionables}
        onMentionsChange={setReplyMentions}
        aria-label="Reply body"
        placeholder="Write a reply…"
        rows={2}
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
  ) : null;

  // When there are replies to show, wrap them (and the composer) in an Accordion.
  // When there are no replies but the user can reply, show just the composer (no Accordion needed).
  if (hasItems) {
    return (
      <div className={styles.repliesSection}>
        <Accordion summary={summaryText}>
          {replyList}
          {composer}
        </Accordion>
      </div>
    );
  }

  if (composer) {
    return (
      <div className={styles.repliesSection}>
        <div className={styles.composerOnly}>{composer}</div>
      </div>
    );
  }

  return null;
}
