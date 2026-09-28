import type { Circle, PublishTarget } from "../data/types";

/** Feeds every member can publish to. */
const PUBLIC_FEEDS = new Set<PublishTarget>(["square", "loop"]);

export const isPublicFeed = (target: PublishTarget) => PUBLIC_FEEDS.has(target);

/** Members publish to the public feeds and to circles they belong to. */
export function canPublishTo(circles: Circle[], memberId: string, target: PublishTarget): boolean {
  return isPublicFeed(target) || circles.some((c) => c.id === target && c.memberIds.includes(memberId));
}

export function innerCircleOf(circles: Circle[], memberId: string): Circle | null {
  return circles.find((c) => c.type === "inner" && c.memberIds.includes(memberId)) ?? null;
}

/** "IC4", or null when the member has no inner circle. */
export function innerCircleLabel(circles: Circle[], memberId: string): string | null {
  const ic = innerCircleOf(circles, memberId);
  return ic?.number != null ? `IC${ic.number}` : null;
}

/** Adds member to circle. A member belongs to one inner circle at most. */
export function addMemberToCircle(circles: Circle[], circleId: string, memberId: string): Circle[] {
  const target = circles.find((c) => c.id === circleId);
  if (!target) throw new Error(`Circle ${circleId} not found`);
  return circles.map((c) => {
    if (c.id === circleId) {
      return c.memberIds.includes(memberId) ? c : { ...c, memberIds: [...c.memberIds, memberId] };
    }
    if (target.type === "inner" && c.type === "inner" && c.memberIds.includes(memberId)) {
      return { ...c, memberIds: c.memberIds.filter((id) => id !== memberId) };
    }
    return c;
  });
}

export const CIRCLE_TYPE_LABEL: Record<Circle["type"], string> = {
  inner: "Inner",
  interest: "Interest",
  location: "Location",
};

/** "Interest circle"; CSS uppercases it in tags. */
export const circleTag = (circle: Pick<Circle, "type">) => `${CIRCLE_TYPE_LABEL[circle.type]} circle`;

/** "1 member", "7 members". */
export const memberCount = (n: number) => `${n} ${n === 1 ? "member" : "members"}`;
