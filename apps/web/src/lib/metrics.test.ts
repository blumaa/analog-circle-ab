import { describe, expect, it } from "vitest";
import { experiencesAttended, innerCircleHealth, periodStats, treeAge, weekRange, weekStats } from "./metrics";
import type { Activity, Circle, Member, Post, Rsvp } from "../data/types";

const now = new Date(2026, 8, 24, 12); // Thu 24 Sep 2026

const m = (id: string, joinedAt = "2026-01-01T00:00:00Z"): Member => ({
  id, name: id, email: "", photoUrl: null, bio: null, phone: null, whatsappUrl: null,
  social: null, birthday: null, role: "member", joinedAt, birthdayPost: true,
});
const ev = (id: string, date: string, publishedTo = ["square"], createdAt = "2026-01-01T00:00:00Z", authorId = "a"): Post => ({
  id, type: "event", title: id, body: "", imageUrl: null, authorId, publishedTo, createdAt,
  updatedAt: null, pinned: false, reactions: {}, commentCount: 0, celebrantId: null,
  event: { date, startTime: null, endTime: null, address: null, addressVisible: true, canBringFriend: false, guestLimit: null },
});
const r = (postId: string, memberId: string, status: Rsvp["status"] = "going", updatedAt = "2026-09-23T00:00:00Z"): Rsvp => ({
  postId, memberId, status, updatedAt,
});

describe("weekRange", () => {
  it("Mon to Sun", () => {
    const { from, to } = weekRange(now);
    expect([from.getDate(), to.getDate()]).toEqual([21, 27]);
  });
});

describe("treeAge", () => {
  it("rounds down to half months and names stage", () => {
    expect(treeAge("2025-12-13T00:00:00Z", now)).toEqual({ months: 9, stage: "Maturing" });
    expect(treeAge("2026-09-01T00:00:00Z", now).stage).toBe("Seedling");
  });
});

describe("weekStats", () => {
  it("counts new members, events this week and unique rsvps", () => {
    const members = [m("a", "2026-09-22T10:00:00"), m("b")];
    const posts = [ev("e1", "2026-09-22"), ev("e2", "2026-09-27"), ev("old", "2026-09-20")];
    const rsvps = [r("e1", "a"), r("e2", "a"), r("e2", "b", "declined"), r("old", "c")];
    const s = weekStats(members, posts, rsvps, now);
    expect(s.newMembers.map((x) => x.id)).toEqual(["a"]);
    expect(s.experiences.map((x) => x.id)).toEqual(["e1", "e2"]);
    expect([s.going, s.cancellations, s.goingPct, s.cancellationPct]).toEqual([1, 1, 50, 50]);
  });
});

describe("periodStats", () => {
  it("splits inactive, creators and active", () => {
    const members = [m("a"), m("b"), m("c")];
    const posts = [ev("e1", "2026-09-30", ["square"], "2026-09-20T00:00:00Z", "a")];
    const rsvps = [r("e1", "b")];
    const activity: Activity[] = [
      { id: "x", type: "comment", actorId: "b", subjectId: "a", targetRoute: "/", createdAt: "2026-09-22T00:00:00Z", readBy: [] },
    ];
    const s = periodStats(members, posts, rsvps, activity, 30, now);
    expect(s.inactive.map((x) => x.id)).toEqual(["c"]);
    expect(s.creators.map((x) => [x.member.id, x.count])).toEqual([["a", 1]]);
    expect(s.active.map((x) => [x.member.id, x.count])).toEqual([["b", 2], ["a", 1]]);
  });
});

describe("innerCircleHealth", () => {
  it("finds 2 and 3+ missed in a row", () => {
    const circle: Circle = { id: "ic1", type: "inner", name: "", description: "", number: 1, imageUrl: null, createdBy: "", createdAt: "", memberIds: ["a", "b", "c"] };
    const posts = [ev("d1", "2026-06-01", ["ic1"]), ev("d2", "2026-07-01", ["ic1"]), ev("d3", "2026-08-01", ["ic1"]), ev("next", "2026-10-01", ["ic1"])];
    const rsvps = [r("d1", "a"), r("d2", "a"), r("d3", "a"), r("d1", "b"), r("d2", "b", "declined")];
    const h = innerCircleHealth([m("a"), m("b"), m("c")], [circle], posts, rsvps, now);
    expect(h.missed2.map((x) => x.member.id)).toEqual(["b"]);
    expect(h.missed3.map((x) => x.member.id)).toEqual(["c"]);
  });
});

describe("experiencesAttended", () => {
  it("lists past events the member went to, newest first", () => {
    const posts = [ev("e1", "2026-08-01"), ev("e2", "2026-09-01"), ev("future", "2026-10-01"), ev("no", "2026-09-10")];
    const rsvps = [r("e1", "a"), r("e2", "a"), r("future", "a"), r("no", "a", "declined")];
    expect(experiencesAttended("a", posts, rsvps, now).map((p) => p.id)).toEqual(["e2", "e1"]);
  });
});
