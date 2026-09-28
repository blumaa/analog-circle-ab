import type { Circle, Post } from "../data/types";
import { innerCircleOf } from "./circles";
import { addDays, startOfWeek } from "./dates";
import { isVisible } from "./feed";

/** Dot colour category: the viewer's inner circle, any other circle, or public feeds. */
export type EventTone = "myCircle" | "circle" | "public";

/** Monday-start weeks covering every day of the month holding `month`. */
export function monthGrid(month: Date): Date[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const weeks: Date[][] = [];
  for (let start = startOfWeek(first); start <= last; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return weeks;
}

export function eventTone(post: Post, viewerId: string, circles: Circle[]): EventTone {
  const inner = innerCircleOf(circles, viewerId);
  if (inner && post.publishedTo.includes(inner.id)) return "myCircle";
  return post.publishedTo.some((t) => circles.some((c) => c.id === t)) ? "circle" : "public";
}

/** Visible events with a date, keyed by ISO day. */
export function eventsByDay(posts: Post[], viewerId: string, circles: Circle[]): Map<string, Post[]> {
  const byDay = new Map<string, Post[]>();
  for (const post of posts) {
    const date = post.event?.date;
    if (post.type !== "event" || !date || !isVisible(post, viewerId, circles)) continue;
    byDay.set(date, [...(byDay.get(date) ?? []), post]);
  }
  return byDay;
}
