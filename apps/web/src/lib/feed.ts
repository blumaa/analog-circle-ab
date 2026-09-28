import type { Circle, Post, PostType, Prefs, Rsvp } from "../data/types";
import { rsvpStatus } from "./events";
import { innerCircleOf, isPublicFeed } from "./circles";
import { reactionTotal } from "./reactions";
import { startOfWeek, toIsoDate } from "./dates";

export type FeedKey = "community" | "myCircle" | "square" | "loop";
export type FeedTab = FeedKey | "favourites";

export type DateRange = "any" | "week" | "month" | "custom";

export interface PostFilter {
  types: PostType[];
  publishedIn: FeedKey[];
  date: DateRange;
  /** ISO dates, used when date === "custom". */
  from: string | null;
  to: string | null;
  favouritesOnly: boolean;
  goingOnly: boolean;
}

export const EMPTY_FILTER: PostFilter = {
  types: [],
  publishedIn: [],
  date: "any",
  from: null,
  to: null,
  favouritesOnly: false,
  goingOnly: false,
};

export type SortBy = "newest" | "soonest" | "reactions" | "comments";
export type SortOrder = "asc" | "desc";
export interface PostSort {
  by: SortBy;
  order: SortOrder;
}
export const DEFAULT_SORT: PostSort = { by: "newest", order: "desc" };

export interface FeedContext {
  viewerId: string;
  circles: Circle[];
  prefs: Pick<Prefs, "favouritePostIds">;
  rsvps: Rsvp[];
}

/** Viewer sees posts on public feeds, in circles they belong to, or their own. */
export function isVisible(post: Post, viewerId: string, circles: Circle[]): boolean {
  if (post.authorId === viewerId) return true;
  return post.publishedTo.some((target) => {
    if (isPublicFeed(target)) return true;
    return circles.find((c) => c.id === target)?.memberIds.includes(viewerId) ?? false;
  });
}

export function inFeed(post: Post, key: FeedKey, ctx: FeedContext): boolean {
  switch (key) {
    case "square":
      return post.type === "event";
    case "loop":
      return post.publishedTo.includes("loop");
    case "myCircle": {
      const inner = innerCircleOf(ctx.circles, ctx.viewerId);
      return !!inner && post.publishedTo.includes(inner.id);
    }
    case "community":
      return post.publishedTo.some(
        (t) => ctx.circles.find((c) => c.id === t && c.type !== "inner") !== undefined,
      );
  }
}

/** Multi-select tabs. Empty set = All. Tabs OR together. */
export function matchesTabs(post: Post, tabs: ReadonlySet<FeedTab>, ctx: FeedContext): boolean {
  if (tabs.size === 0) return true;
  for (const tab of tabs) {
    if (tab === "favourites" ? ctx.prefs.favouritePostIds.includes(post.id) : inFeed(post, tab, ctx)) {
      return true;
    }
  }
  return false;
}

/** Events use their date; other posts their creation day. */
export function postDay(post: Post): string | null {
  if (post.type === "event") return post.event?.date ?? null;
  return toIsoDate(new Date(post.createdAt));
}

export function dateBounds(filter: PostFilter, now: Date): { from: string; to: string } | null {
  switch (filter.date) {
    case "any":
      return null;
    case "week": {
      const start = startOfWeek(now);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { from: toIsoDate(start), to: toIsoDate(end) };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { from: toIsoDate(start), to: toIsoDate(end) };
    }
    case "custom":
      return { from: filter.from ?? "0000-01-01", to: filter.to ?? "9999-12-31" };
  }
}

export function matchesFilter(post: Post, filter: PostFilter, ctx: FeedContext, now: Date): boolean {
  if (filter.types.length && !filter.types.includes(post.type)) return false;
  if (filter.publishedIn.length && !filter.publishedIn.some((k) => inFeed(post, k, ctx))) return false;
  if (filter.favouritesOnly && !ctx.prefs.favouritePostIds.includes(post.id)) return false;
  if (filter.goingOnly && !isGoing(post.id, ctx.viewerId, ctx.rsvps)) return false;
  const bounds = dateBounds(filter, now);
  if (bounds) {
    const day = postDay(post);
    if (!day || day < bounds.from || day > bounds.to) return false;
  }
  return true;
}

export function isGoing(postId: string, memberId: string, rsvps: Rsvp[]): boolean {
  return rsvpStatus(postId, memberId, rsvps) === "going";
}

/** Title, text, a visible event address, or related text such as the author's name and comments. */
export function matchesSearch(post: Post, query: string, related: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const address = post.event?.addressVisible ? (post.event.address ?? "") : "";
  return [post.title, post.body, address, ...related].some((s) => s.toLowerCase().includes(q));
}

function sortKey(post: Post, by: SortBy): number | string {
  switch (by) {
    case "newest":
      return post.createdAt;
    case "soonest":
      return postDay(post) ?? "";
    case "reactions":
      return reactionTotal(post.reactions);
    case "comments":
      return post.commentCount;
  }
}

/** Pinned posts stay on top; the rest follow the chosen sort. */
export function sortPosts(posts: Post[], sort: PostSort): Post[] {
  const dir = sort.order === "asc" ? 1 : -1;
  return posts.toSorted((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const ka = sortKey(a, sort.by);
    const kb = sortKey(b, sort.by);
    if (ka === kb) return b.createdAt.localeCompare(a.createdAt);
    return (ka < kb ? -1 : 1) * dir;
  });
}

export function activeFilterCount(filter: PostFilter): number {
  return (
    filter.types.length +
    filter.publishedIn.length +
    (filter.date === "any" ? 0 : 1) +
    (filter.favouritesOnly ? 1 : 0) +
    (filter.goingOnly ? 1 : 0)
  );
}

/** Toggles one feed tab. An empty set means All. */
export function toggleTab(tabs: ReadonlySet<FeedTab>, tab: FeedTab): Set<FeedTab> {
  const next = new Set(tabs);
  if (!next.delete(tab)) next.add(tab);
  return next;
}

export interface FeedQuery {
  tabs: ReadonlySet<FeedTab>;
  filter: PostFilter;
  sort: PostSort;
  query: string;
  authorName: (authorId: string) => string;
  /** Comment text per post. Omit to leave comments out of search. */
  commentBodies?: (postId: string) => string[];
  now: Date;
}

/** Everything the viewer should see in a post list, in display order. */
export function selectFeed(posts: Post[], ctx: FeedContext, q: FeedQuery): Post[] {
  const shown = posts.filter(
    (p) =>
      isVisible(p, ctx.viewerId, ctx.circles) &&
      matchesTabs(p, q.tabs, ctx) &&
      matchesFilter(p, q.filter, ctx, q.now) &&
      matchesSearch(p, q.query, [q.authorName(p.authorId), ...(q.commentBodies?.(p.id) ?? [])]),
  );
  return sortPosts(shown, q.sort);
}
