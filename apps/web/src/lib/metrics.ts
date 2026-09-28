import { addDays, startOfWeek, toIsoDate } from "./dates";
import type { Activity, Circle, Member, Post, Rsvp } from "../data/types";

const DAY_MS = 86_400_000;

/** Monday..Sunday (local dates) of the week holding `now`. */
export function weekRange(now: Date): { from: Date; to: Date } {
  const from = startOfWeek(now);
  return { from, to: addDays(from, 6) };
}

export type TreeStage = "Seedling" | "Growing" | "Maturing" | "Mature";

/** TAC tree: age in half-months since founding, and its stage. */
export function treeAge(foundedAt: string, now: Date): { months: number; stage: TreeStage } {
  const months = Math.floor(((now.getTime() - new Date(foundedAt).getTime()) / (DAY_MS * 30.44)) * 2) / 2;
  const stage: TreeStage = months < 3 ? "Seedling" : months < 6 ? "Growing" : months < 12 ? "Maturing" : "Mature";
  return { months, stage };
}

export interface WeekStats {
  newMembers: Member[];
  experiences: Post[];
  going: number;
  cancellations: number;
  goingPct: number;
  cancellationPct: number;
}

export function weekStats(members: Member[], posts: Post[], rsvps: Rsvp[], now: Date): WeekStats {
  const { from, to } = weekRange(now);
  const end = new Date(to.getTime() + DAY_MS);
  const fromDay = toIsoDate(from);
  const toDay = toIsoDate(to);
  const newMembers = members.filter((m) => {
    const t = new Date(m.joinedAt);
    return t >= from && t < end;
  });
  const experiences = posts.filter(
    (p) => p.type === "event" && p.event?.date != null && p.event.date >= fromDay && p.event.date <= toDay,
  );
  const ids = new Set(experiences.map((p) => p.id));
  const unique = (status: Rsvp["status"]) =>
    new Set(rsvps.filter((r) => ids.has(r.postId) && r.status === status).map((r) => r.memberId)).size;
  const going = unique("going");
  const cancellations = unique("declined");
  const total = going + cancellations;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  return { newMembers, experiences, going, cancellations, goingPct: pct(going), cancellationPct: pct(cancellations) };
}

export const PERIODS = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
  { days: 365, label: "Last 12 months" },
] as const;

export interface MemberCount {
  member: Member;
  count: number;
}

export interface PeriodStats {
  inactive: Member[];
  creators: MemberCount[];
  active: MemberCount[];
}

const byCount = (a: MemberCount, b: MemberCount) => b.count - a.count || a.member.name.localeCompare(b.member.name);

/** Activity = posts written, RSVPs given, comments and replies, inside the period. */
export function periodStats(
  members: Member[],
  posts: Post[],
  rsvps: Rsvp[],
  activity: Activity[],
  days: number,
  now: Date,
): PeriodStats {
  const since = now.getTime() - days * DAY_MS;
  const inPeriod = (iso: string) => new Date(iso).getTime() >= since;
  const created = new Map<string, number>();
  const actions = new Map<string, number>();
  const bump = (map: Map<string, number>, id: string) => map.set(id, (map.get(id) ?? 0) + 1);

  for (const p of posts) {
    if (p.type === "birthday" || !inPeriod(p.createdAt)) continue;
    bump(created, p.authorId);
    bump(actions, p.authorId);
  }
  for (const r of rsvps) if (inPeriod(r.updatedAt)) bump(actions, r.memberId);
  for (const a of activity) {
    if ((a.type === "comment" || a.type === "reply") && inPeriod(a.createdAt)) bump(actions, a.actorId);
  }

  const counted = (map: Map<string, number>) =>
    members.flatMap((member) => {
      const count = map.get(member.id);
      return count ? [{ member, count }] : [];
    }).toSorted(byCount);

  return {
    inactive: members.filter((m) => !actions.has(m.id)),
    creators: counted(created),
    active: counted(actions),
  };
}

/** Past dinners of an inner circle, newest first. */
export function pastDinners(circle: Circle, posts: Post[], now: Date): Post[] {
  const today = toIsoDate(now);
  return posts
    .filter((p) => p.type === "event" && p.publishedTo.includes(circle.id) && p.event?.date != null && p.event.date < today)
    .toSorted((a, b) => b.event!.date!.localeCompare(a.event!.date!));
}

/** Consecutive most-recent dinners the member did not go to. */
export function missedStreak(memberId: string, dinners: Post[], rsvps: Rsvp[]): number {
  let streak = 0;
  for (const d of dinners) {
    const went = rsvps.some((r) => r.postId === d.id && r.memberId === memberId && r.status === "going");
    if (went) break;
    streak++;
  }
  return streak;
}

export interface MissedDinners {
  member: Member;
  circle: Circle;
  streak: number;
}

/** Members who missed 2 in a row (exactly) and 3+ in a row. */
export function innerCircleHealth(
  members: Member[],
  circles: Circle[],
  posts: Post[],
  rsvps: Rsvp[],
  now: Date,
): { missed2: MissedDinners[]; missed3: MissedDinners[] } {
  const missed2: MissedDinners[] = [];
  const missed3: MissedDinners[] = [];
  for (const circle of circles.filter((c) => c.type === "inner")) {
    const dinners = pastDinners(circle, posts, now);
    for (const id of circle.memberIds) {
      const member = members.find((m) => m.id === id);
      if (!member) continue;
      const streak = missedStreak(id, dinners, rsvps);
      if (streak >= 3) missed3.push({ member, circle, streak });
      else if (streak === 2) missed2.push({ member, circle, streak });
    }
  }
  return { missed2, missed3 };
}

/** Past events the member went to, newest first. */
export function experiencesAttended(memberId: string, posts: Post[], rsvps: Rsvp[], now: Date): Post[] {
  const today = toIsoDate(now);
  const going = new Set(rsvps.filter((r) => r.memberId === memberId && r.status === "going").map((r) => r.postId));
  return posts
    .filter((p) => p.type === "event" && going.has(p.id) && p.event?.date != null && p.event.date < today)
    .toSorted((a, b) => b.event!.date!.localeCompare(a.event!.date!));
}
