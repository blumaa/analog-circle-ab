import type { Circle, Post, PostType } from "../data/types";
import { innerCircleOf } from "./circles";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  event: "Event",
  post: "Post",
  birthday: "Birthday",
  offer: "Offer",
  need: "Need",
};

/** Where the post was shared, from the viewer's point of view. Null for the Square alone. */
export function postAudience(post: Post, circles: Circle[], viewerId: string): string | null {
  if (post.type === "birthday") return null;
  const inner = innerCircleOf(circles, viewerId);
  if (inner && post.publishedTo.includes(inner.id)) return "My Circle";
  const named = post.publishedTo.flatMap((t) => circles.find((c) => c.id === t) ?? []);
  const [first] = named;
  if (first && named.length === 1) return first.name;
  if (named.length > 1) return "Circles";
  if (post.publishedTo.includes("loop")) return "The Loop";
  return null;
}

/** Card tag text, e.g. "Event · My Circle". CSS uppercases it. */
export function postTag(post: Post, circles: Circle[], viewerId: string): string {
  const audience = postAudience(post, circles, viewerId);
  return [POST_TYPE_LABEL[post.type], audience].filter(Boolean).join(" · ");
}

export function postTone(type: PostType): "gold" | "green" | "pink" {
  if (type === "birthday") return "pink";
  if (type === "offer" || type === "need") return "green";
  return "gold";
}
