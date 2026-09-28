import { Link } from "react-router-dom";
import { Bookmark, ChevronDown, ChevronUp, MessageCircle, Pin, SmilePlus } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarStack, IconButton, TypeTag } from "@analog/ui";
import {
  useCircles,
  useMe,
  useMembers,
  usePrefList,
  useRsvps,
  useSetRsvp,
  useTogglePostReaction,
} from "../../data/hooks";
import { postRoute } from "../../data/backendRules";
import type { Post, RsvpStatus } from "../../data/types";
import { formatEventWhen } from "../../lib/dates";
import { isGoing } from "../../lib/feed";
import { firstName } from "../../lib/names";
import { postTag, postTone } from "../../lib/postLabel";
import { reactionSummary, reactionTotal } from "../../lib/reactions";
import { PeopleSheet } from "../members/PeopleSheet";
import { CommentThread } from "./CommentThread";
import { EmojiPicker } from "./EmojiPicker";
import { PostActions } from "./PostActions";
import { RsvpConfirmSheet } from "./RsvpConfirmSheet";
import styles from "./PostCard.module.css";

/** Emoji shown in the footer pill; the full breakdown is in its label and on the detail page. */
const MAX_PILL_EMOJI = 3;

export interface PostCardProps {
  post: Post;
  expanded: boolean;
  onToggleComments: () => void;
}

export function PostCard({ post, expanded, onToggleComments }: PostCardProps) {
  const { me } = useMe();
  const { data: members = [] } = useMembers();
  const { data: circles = [] } = useCircles();
  const { data: rsvps = [] } = useRsvps();
  const favourites = usePrefList(me?.id, "favouritePostIds");
  const setRsvp = useSetRsvp();
  const react = useTogglePostReaction();
  const [picking, setPicking] = useState(false);
  const [showGoing, setShowGoing] = useState(false);
  const [pendingRsvp, setPendingRsvp] = useState<RsvpStatus | null>(null);
  if (!me) return null;

  const author = members.find((m) => m.id === post.authorId);
  const isEvent = post.type === "event";
  const isBirthday = post.type === "birthday";
  const going = rsvps.filter((r) => r.postId === post.id && r.status === "going");
  const goingPeople = going.flatMap((r) => members.find((m) => m.id === r.memberId) ?? []);
  const imGoing = isGoing(post.id, me.id, rsvps);
  const summary = reactionSummary(post.reactions, me.id);
  const mine = new Set(summary.filter((r) => r.mine).map((r) => r.emoji));
  const saved = favourites.has(post.id);
  const detailHref = postRoute(post);

  const title = (
    <Link to={detailHref} className={styles.titleLink}>
      {post.title}
    </Link>
  );

  const head = (
    <div className={styles.titleRow}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.tags}>
        <TypeTag tone={postTone(post.type)}>{postTag(post, circles, me.id)}</TypeTag>
        {post.pinned && (
          <span className={styles.pin} role="img" aria-label="Pinned">
            <Pin size={14} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
        <PostActions post={post} me={me} />
      </div>
    </div>
  );

  const byline = !isBirthday && (
    <p className={styles.byline}>
      <Avatar name={author?.name ?? "Former member"} src={author?.photoUrl} size={20} decorative />
      by {author ? firstName(author.name) : "a former member"}
    </p>
  );

  const rsvpButton = isEvent && (
    <button
      type="button"
      className={styles.rsvp}
      aria-pressed={imGoing}
      onClick={() => setPendingRsvp(imGoing ? "declined" : "going")}
    >
      {imGoing ? "Going ✓" : "RSVP"}
    </button>
  );

  const thumb = post.imageUrl && <img src={post.imageUrl} alt="" className={styles.thumb} />;

  return (
    <article className={styles.card} aria-label={post.title}>
      <div className={styles.body}>
        {head}
        {byline}
        {isBirthday ? (
          <div className={styles.split}>
            <p className={styles.birthday}>Happy Birthday</p>
            {thumb}
          </div>
        ) : (
          <div className={styles.split}>
            <div className={styles.text}>
              {isEvent && post.event && <p className={styles.when}>{formatEventWhen(post.event)}</p>}
              {post.body && <p className={styles.description}>{post.body}</p>}
            </div>
            {thumb && (
              <Link to={detailHref} aria-label={`Open ${post.title}`} className={styles.thumbLink}>
                {thumb}
              </Link>
            )}
            {!thumb && rsvpButton}
          </div>
        )}
        {thumb && rsvpButton && <div className={styles.rsvpRow}>{rsvpButton}</div>}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.pill}
          aria-label={
            summary.length ? `Reactions: ${summary.map((r) => `${r.emoji} ${r.count}`).join(", ")}. React` : "React"
          }
          aria-expanded={picking}
          onClick={() => setPicking((p) => !p)}
        >
          {summary.length ? (
            <>
              <span className={styles.emoji}>
                {summary
                  .slice(0, MAX_PILL_EMOJI)
                  .map((r) => r.emoji)
                  .join("")}
              </span>
              {reactionTotal(post.reactions)}
            </>
          ) : (
            <SmilePlus size={14} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
        {isEvent && going.length > 0 && (
          <button
            type="button"
            className={styles.going}
            aria-label={`See who's going (${going.length})`}
            onClick={() => setShowGoing(true)}
          >
            <AvatarStack people={goingPeople.map((m) => ({ name: m.name, src: m.photoUrl }))} size={22} max={3} />
            <span>{going.length} going</span>
          </button>
        )}
        <span className={styles.spacer} />
        <IconButton
          label={saved ? "Remove from favourites" : "Save to favourites"}
          variant="ghost"
          size={30}
          pressed={saved}
          icon={<Bookmark size={18} strokeWidth={1.75} fill={saved ? "currentColor" : "none"} />}
          onClick={() => favourites.toggle(post.id)}
        />
        <button
          type="button"
          className={styles.pill}
          data-open={expanded || undefined}
          aria-expanded={expanded}
          aria-label={`${post.commentCount} comments`}
          onClick={onToggleComments}
        >
          <MessageCircle size={14} strokeWidth={1.75} aria-hidden="true" />
          {post.commentCount}
          {expanded ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
        </button>
      </footer>
      {picking && (
        <div className={styles.picker}>
          <EmojiPicker
            mine={mine}
            onPick={(emoji) => {
              react.mutate({ postId: post.id, memberId: me.id, emoji });
              setPicking(false);
            }}
          />
        </div>
      )}
      {expanded && (
        <div className={styles.comments}>
          <CommentThread postId={post.id} compact={isBirthday} />
        </div>
      )}
      {isEvent && (
        <>
          <PeopleSheet open={showGoing} onClose={() => setShowGoing(false)} title="Going" people={goingPeople} />
          <RsvpConfirmSheet
            post={post}
            pending={pendingRsvp}
            onClose={() => setPendingRsvp(null)}
            onConfirm={(status) => setRsvp.mutate({ postId: post.id, memberId: me.id, status })}
          />
        </>
      )}
    </article>
  );
}
