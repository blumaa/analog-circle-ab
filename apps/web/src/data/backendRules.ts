import type { Activity, Circle, Comment, Post, PostInput, PublishTarget } from "./types";
import { canPublishTo } from "../lib/circles";

/**
 * Domain rules every backend applies the same way. Keeping them here means
 * the mock and Firebase backends cannot drift apart.
 */

export type ActivityInput = Omit<Activity, "id" | "createdAt" | "readBy">;

/** A new post with the fields the backend owns filled in. */
export function buildPost(input: PostInput, id: string, createdAt: string): Post {
  return {
    ...input,
    id,
    createdAt,
    updatedAt: null,
    pinned: false,
    reactions: {},
    commentCount: 0,
    celebrantId: null,
  };
}

/** The post's detail page. Titles and notifications link here. */
export function postRoute(post: Post): string {
  return post.type === "event" ? `/events/${post.id}` : `/posts/${post.id}`;
}

/**
 * Throws when the author adds a target they may not publish to. Targets the
 * post already has stay valid, so leaving a circle doesn't lock its posts.
 */
export function assertPublishable(
  circles: Circle[],
  authorId: string,
  targets: PublishTarget[],
  existing: PublishTarget[] = [],
): void {
  const refused = targets.filter((t) => !existing.includes(t) && !canPublishTo(circles, authorId, t));
  if (refused.length > 0) throw new Error(`Cannot publish to ${refused.join(", ")}`);
}

/** Trimmed feedback text. Throws when nothing is left. */
export function feedbackBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Feedback is empty");
  return trimmed;
}

/** Newest first. */
export const byNewest = <T extends { createdAt: string }>(items: T[]): T[] =>
  items.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Replies never nest: a reply to a reply attaches to the top-level comment. */
export function replyParentId(parent: Comment | null): string | null {
  return parent ? (parent.parentId ?? parent.id) : null;
}

/** The activity a new comment or reply produces. */
export function commentActivity(post: Post, parent: Comment | null, authorId: string): ActivityInput {
  return parent
    ? { type: "reply", actorId: authorId, subjectId: parent.authorId, targetRoute: postRoute(post) }
    : { type: "comment", actorId: authorId, subjectId: post.authorId, targetRoute: postRoute(post) };
}

/** Members are not notified about their own actions. */
export function isSelfAddressed(input: Pick<ActivityInput, "actorId" | "subjectId">): boolean {
  return input.subjectId !== null && input.subjectId === input.actorId;
}
