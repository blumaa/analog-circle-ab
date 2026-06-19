import { useMemo, useState } from "react";
import { Label, SegmentedControl, useToast } from "@analog/ui";
import {
  useActivity,
  useAddWallPostReply,
  useCreateWallPost,
  useCurrentMemberId,
  useDeleteWallPost,
  useInnerGroup,
  useMembers,
  useToggleWallPostLike,
  useWallPosts,
} from "../data/hooks";
import type { Activity, Member, Scope, WallPost } from "../data/types";
import { activityText } from "../lib/activityText";
import { canDeleteWallPost } from "../lib/permissions";
import { WallComposer } from "./WallComposer";
import { WallPostCard } from "./WallPostCard";
import styles from "./ProfileWall.module.css";

export interface ProfileWallProps {
  ownerId: string;
}

type FilterTab = "analog" | "inner" | "personal";

const TABS = [
  { value: "analog", label: "Analog Circle" },
  { value: "inner", label: "Inner Circle" },
  { value: "personal", label: "Personal" },
];

/**
 * A unified feed item. Carries normalized `scope`/`timestamp` so merge, sort,
 * and filtering never re-derive them from the underlying record.
 */
type FeedItem =
  | { kind: "post"; id: string; scope: Scope; timestamp: string; post: WallPost }
  | { kind: "activity"; id: string; scope: Scope; timestamp: string; activity: Activity };

/** Merge wall posts + activity into one list, newest first. */
function buildFeed(posts: WallPost[], activity: Activity[]): FeedItem[] {
  const postItems: FeedItem[] = posts.map((post) => ({
    kind: "post",
    id: `post:${post.id}`,
    scope: post.scope,
    timestamp: post.createdAt,
    post,
  }));
  const activityItems: FeedItem[] = activity.map((a) => ({
    kind: "activity",
    id: `activity:${a.id}`,
    scope: a.scope,
    timestamp: a.createdAt,
    activity: a,
  }));
  return [...postItems, ...activityItems].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/** Inner-scope items are only visible to viewers who share the owner's inner circle. */
function applyInnerVisibility(items: FeedItem[], canSeeInner: boolean): FeedItem[] {
  return items.filter((item) => item.scope === "analog" || canSeeInner);
}

/**
 * Filter the feed for the active tab.
 * - analog/inner: by scope.
 * - personal: everything about THIS wall — posts on the wall (always, since
 *   useWallPosts already scopes to ownerId) plus activity whose subject is the owner.
 */
function filterFeed(items: FeedItem[], tab: FilterTab, ownerId: string): FeedItem[] {
  switch (tab) {
    case "analog":
      return items.filter((item) => item.scope === "analog");
    case "inner":
      return items.filter((item) => item.scope === "inner");
    case "personal":
      return items.filter((item) =>
        item.kind === "post" ? true : item.activity.subjectId === ownerId,
      );
  }
}

export function ProfileWall({ ownerId }: ProfileWallProps) {
  const { data: currentMemberId = null } = useCurrentMemberId();
  const { data: posts = [] } = useWallPosts(ownerId);
  const { data: activity = [] } = useActivity();
  const { data: members = [] } = useMembers();
  const createPost = useCreateWallPost(ownerId);
  const deletePost = useDeleteWallPost(ownerId);
  const toggleLike = useToggleWallPostLike(ownerId);
  const addReply = useAddWallPostReply(ownerId);
  const toast = useToast();
  const { data: viewerInnerGroup = null } = useInnerGroup(currentMemberId);
  const { data: ownerInnerGroup = null } = useInnerGroup(ownerId);

  const [tab, setTab] = useState<FilterTab>("personal");

  const sharesInnerCircle =
    viewerInnerGroup !== null &&
    ownerInnerGroup !== null &&
    viewerInnerGroup.id === ownerInnerGroup.id;

  const canPostInner = currentMemberId === ownerId || sharesInnerCircle;
  const canSeeInner = canPostInner;

  const getMemberName = (memberId: string): string =>
    members.find((m) => m.id === memberId)?.name ?? memberId;

  const getMember = (memberId: string): Member | undefined =>
    members.find((m) => m.id === memberId);

  const visible = useMemo(() => {
    const feed = buildFeed(posts, activity);
    const seen = applyInnerVisibility(feed, canSeeInner);
    return filterFeed(seen, tab, ownerId);
  }, [posts, activity, canSeeInner, tab, ownerId]);

  return (
    <section className={styles.wall}>
      <Label as="div">Wall</Label>

      {currentMemberId && (
        <WallComposer
          ownerId={ownerId}
          authorId={currentMemberId}
          canPostInner={canPostInner}
          members={members}
          onPost={(input) =>
            createPost.mutate(input, {
              onSuccess: () => toast.success("Posted to the wall."),
              onError: () => toast.error("Couldn't post to the wall."),
            })
          }
        />
      )}

      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={(v) => setTab(v as FilterTab)}
        ariaLabel="Wall filter"
        className={styles.tabs}
      />

      {visible.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.posts}>
          {visible.map((item) => (
            <li key={item.id}>
              {item.kind === "post" ? (
                <WallPostFeedCard
                  post={item.post}
                  currentMemberId={currentMemberId}
                  getMemberName={getMemberName}
                  getMember={getMember}
                  onDelete={() =>
                    deletePost.mutate(item.post.id, {
                      onSuccess: () => toast.success("Post removed."),
                      onError: () => toast.error("Couldn't remove the post."),
                    })
                  }
                  onToggleLike={
                    currentMemberId
                      ? () =>
                          toggleLike.mutate(
                            { postId: item.post.id, memberId: currentMemberId },
                            { onError: () => toast.error("Couldn't update like.") },
                          )
                      : undefined
                  }
                  onReply={
                    currentMemberId
                      ? (body) =>
                          addReply.mutate(
                            { postId: item.post.id, authorId: currentMemberId, body },
                            { onError: () => toast.error("Couldn't post your reply.") },
                          )
                      : undefined
                  }
                />
              ) : (
                <ActivityFeedCard
                  activity={item.activity}
                  members={members}
                  currentMemberId={currentMemberId}
                  getMember={getMember}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Private feed cards ────────────────────────────────────────────────────────

interface WallPostFeedCardProps {
  post: WallPost;
  currentMemberId: string | null;
  getMemberName: (memberId: string) => string;
  getMember: (memberId: string) => Member | undefined;
  onDelete: () => void;
  onToggleLike?: () => void;
  onReply?: (body: string) => void;
}

function WallPostFeedCard({
  post,
  currentMemberId,
  getMemberName,
  getMember,
  onDelete,
  onToggleLike,
  onReply,
}: WallPostFeedCardProps) {
  const author = getMember(post.authorId);
  const likedBy = post.likedBy ?? [];
  const canDelete = canDeleteWallPost(post, currentMemberId);

  return (
    <WallPostCard
      author={{ name: author?.name ?? post.authorId, photoUrl: author?.photoUrl }}
      timestamp={post.createdAt}
      scope={post.scope}
      likes={{
        count: likedBy.length,
        likerNames: likedBy.map(getMemberName),
        hasLiked: currentMemberId !== null && likedBy.includes(currentMemberId),
        onToggle: onToggleLike,
      }}
      replies={{
        items: post.replies.map((reply) => ({
          author: getMemberName(reply.authorId),
          body: reply.body,
          timestamp: reply.createdAt,
        })),
        canReply: currentMemberId !== null,
        onReply,
      }}
      onDelete={canDelete ? onDelete : undefined}
    >
      <p className={styles.body}>{post.body}</p>
      {post.imageUrl && <img src={post.imageUrl} alt="" className={styles.image} />}
    </WallPostCard>
  );
}

interface ActivityFeedCardProps {
  activity: Activity;
  members: Member[];
  currentMemberId: string | null;
  getMember: (memberId: string) => Member | undefined;
}

function ActivityFeedCard({
  activity,
  members,
  currentMemberId,
  getMember,
}: ActivityFeedCardProps) {
  const actor = getMember(activity.actorId);
  return (
    <WallPostCard
      author={{ name: actor?.name ?? activity.actorId, photoUrl: actor?.photoUrl }}
      timestamp={activity.createdAt}
      scope={activity.scope}
      href={activity.targetRoute}
    >
      <p className={styles.body}>
        {activityText(activity, members, currentMemberId ?? "")}
      </p>
    </WallPostCard>
  );
}
