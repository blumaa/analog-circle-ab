import type { Circle, Member, Post } from "../data/types";
import { CIRCLE_TYPE_LABEL, innerCircleOf, memberCount } from "./circles";
import { formatDay, formatShortMonthYear, fromIsoDate } from "./dates";
import { upcomingEvents } from "./events";

/** Inner circles hold seven members. */
export const INNER_CIRCLE_SIZE = 7;

/** "Admin · email" or "Member · joined Mar 2026". */
export function memberMeta(member: Member): string {
  return member.role === "admin" ? `Admin · ${member.email}` : `Member · joined ${formatShortMonthYear(member.joinedAt)}`;
}

/** "Inner · 7 of 7 members · next dinner Fri 23 Oct". */
export function circleMeta(circle: Circle, posts: Post[], today: string): string {
  const isInner = circle.type === "inner";
  const count = circle.memberIds.length;
  const parts = [
    CIRCLE_TYPE_LABEL[circle.type],
    isInner ? `${count} of ${INNER_CIRCLE_SIZE} members` : memberCount(count),
  ];
  const next = upcomingEvents(posts.filter((p) => p.publishedTo.includes(circle.id)), today)[0];
  if (next) parts.push(`next ${isInner ? "dinner" : "event"} ${formatDay(fromIsoDate(next.event!.date!))}`);
  return parts.join(" · ");
}

export function notPlacedCount(members: Member[], circles: Circle[]): number {
  return members.filter((m) => !innerCircleOf(circles, m.id)).length;
}
