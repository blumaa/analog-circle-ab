import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTER,
  dateBounds,
  isVisible,
  matchesFilter,
  matchesSearch,
  matchesTabs,
  selectFeed,
  sortPosts,
  toggleTab,
  type FeedContext,
} from "./feed";
import type { Circle, Post } from "../data/types";

const circle = (id: string, type: Circle["type"], memberIds: string[]): Circle => ({
  id, type, name: id, description: "", number: type === "inner" ? 1 : null, imageUrl: null,
  createdBy: "x", createdAt: "", memberIds,
});

const post = (over: Partial<Post>): Post => ({
  id: "p", type: "post", title: "Title", body: "Body", imageUrl: null, authorId: "z",
  publishedTo: ["square"], createdAt: "2026-10-01T10:00:00.000Z", updatedAt: null, pinned: false,
  reactions: {}, commentCount: 0, event: null, celebrantId: null, ...over,
});

const event = (id: string, date: string, over: Partial<Post> = {}) =>
  post({
    id, type: "event",
    event: { date, startTime: "10:00", endTime: null, address: null, addressVisible: true, canBringFriend: false, guestLimit: null },
    ...over,
  });

const circles = [circle("ic1", "inner", ["me"]), circle("hike", "interest", ["me"]), circle("ic2", "inner", ["other"])];
const ctx: FeedContext = { viewerId: "me", circles, prefs: { favouritePostIds: ["fav"] }, rsvps: [] };

describe("isVisible", () => {
  it("shows public feeds, own circles and own posts", () => {
    expect(isVisible(post({ publishedTo: ["loop"] }), "me", circles)).toBe(true);
    expect(isVisible(post({ publishedTo: ["ic1"] }), "me", circles)).toBe(true);
    expect(isVisible(post({ publishedTo: ["ic2"] }), "me", circles)).toBe(false);
    expect(isVisible(post({ publishedTo: ["ic2"], authorId: "me" }), "me", circles)).toBe(true);
  });
});

describe("matchesTabs", () => {
  it("empty set = all", () => {
    expect(matchesTabs(post({}), new Set(), ctx)).toBe(true);
  });
  it("myCircle = viewer's inner circle", () => {
    expect(matchesTabs(post({ publishedTo: ["ic1"] }), new Set(["myCircle"]), ctx)).toBe(true);
    expect(matchesTabs(post({ publishedTo: ["hike"] }), new Set(["myCircle"]), ctx)).toBe(false);
  });
  it("community = interest/location circles", () => {
    expect(matchesTabs(post({ publishedTo: ["hike"] }), new Set(["community"]), ctx)).toBe(true);
  });
  it("square = events", () => {
    expect(matchesTabs(event("e", "2026-10-02"), new Set(["square"]), ctx)).toBe(true);
    expect(matchesTabs(post({}), new Set(["square"]), ctx)).toBe(false);
  });
  it("tabs OR together; favourites", () => {
    const tabs = new Set(["loop", "favourites"] as const);
    expect(matchesTabs(post({ id: "fav", publishedTo: ["ic1"] }), tabs, ctx)).toBe(true);
    expect(matchesTabs(post({ publishedTo: ["loop"] }), tabs, ctx)).toBe(true);
    expect(matchesTabs(post({ publishedTo: ["ic1"] }), tabs, ctx)).toBe(false);
  });
});

describe("matchesFilter", () => {
  const now = new Date(2026, 9, 7); // Wed 7 Oct 2026
  it("filters by type", () => {
    expect(matchesFilter(post({}), { ...EMPTY_FILTER, types: ["event"] }, ctx, now)).toBe(false);
  });
  it("this week = Mon to Sun", () => {
    expect(dateBounds({ ...EMPTY_FILTER, date: "week" }, now)).toEqual({ from: "2026-10-05", to: "2026-10-11" });
    const f = { ...EMPTY_FILTER, date: "week" as const };
    expect(matchesFilter(event("e", "2026-10-11"), f, ctx, now)).toBe(true);
    expect(matchesFilter(event("e", "2026-10-12"), f, ctx, now)).toBe(false);
  });
  it("going only", () => {
    const withRsvp = { ...ctx, rsvps: [{ postId: "e", memberId: "me", status: "going" as const, updatedAt: "" }] };
    const f = { ...EMPTY_FILTER, goingOnly: true };
    expect(matchesFilter(event("e", "2026-10-11"), f, withRsvp, now)).toBe(true);
    expect(matchesFilter(event("x", "2026-10-11"), f, withRsvp, now)).toBe(false);
  });
});

describe("matchesSearch", () => {
  it("matches title, body or author, case-insensitive", () => {
    expect(matchesSearch(post({ title: "Sunday brunch" }), "BRUNCH", [])).toBe(true);
    expect(matchesSearch(post({}), "aaron", ["Aaron Blum"])).toBe(true);
    expect(matchesSearch(post({}), "zzz", ["Aaron"])).toBe(false);
  });

  it("matches comments and a visible event address", () => {
    expect(matchesSearch(post({}), "lemon", ["Aaron", "By the lemon tree"])).toBe(true);
    expect(matchesSearch(event("e", "2026-10-09", { event: { ...event("e", "2026-10-09").event!, address: "Weserstraße 58" } }), "weser", [])).toBe(true);
  });

  it("never matches a hidden address", () => {
    const hidden = event("e", "2026-10-09");
    hidden.event = { ...hidden.event!, address: "Holzmarktstraße 25", addressVisible: false };
    expect(matchesSearch(hidden, "holzmarkt", [])).toBe(false);
  });
});

describe("sortPosts", () => {
  it("pinned first, then newest", () => {
    const a = post({ id: "a", createdAt: "2026-10-01T00:00:00Z" });
    const b = post({ id: "b", createdAt: "2026-10-03T00:00:00Z" });
    const pin = post({ id: "pin", createdAt: "2026-09-01T00:00:00Z", pinned: true });
    expect(sortPosts([a, b, pin], { by: "newest", order: "desc" }).map((p) => p.id)).toEqual(["pin", "b", "a"]);
    expect(sortPosts([a, b], { by: "newest", order: "asc" }).map((p) => p.id)).toEqual(["a", "b"]);
  });
  it("by reactions", () => {
    const a = post({ id: "a", reactions: { "🎉": ["1", "2"] } });
    const b = post({ id: "b", reactions: { "🎉": ["1"] } });
    expect(sortPosts([b, a], { by: "reactions", order: "desc" }).map((p) => p.id)).toEqual(["a", "b"]);
  });
});

describe("toggleTab", () => {
  it("adds and removes tabs independently", () => {
    const one = toggleTab(new Set(), "square");
    expect([...one]).toEqual(["square"]);
    expect([...toggleTab(one, "loop")]).toEqual(["square", "loop"]);
    expect([...toggleTab(one, "square")]).toEqual([]);
  });
});

describe("selectFeed", () => {
  const posts = [
    post({ id: "hidden", publishedTo: ["ic2"] }),
    post({ id: "old", title: "Old walk", createdAt: "2026-09-01T10:00:00.000Z" }),
    post({ id: "new", title: "New walk", createdAt: "2026-10-02T10:00:00.000Z" }),
    post({ id: "pin", title: "Pinned", pinned: true, createdAt: "2026-08-01T10:00:00.000Z" }),
  ];
  const base = {
    tabs: new Set<never>(),
    filter: EMPTY_FILTER,
    sort: { by: "newest", order: "desc" } as const,
    query: "",
    authorName: () => "Someone",
    commentBodies: () => [],
    now: new Date("2026-10-03T12:00:00"),
  };

  it("drops invisible posts and sorts pinned first", () => {
    expect(selectFeed(posts, ctx, base).map((p) => p.id)).toEqual(["pin", "new", "old"]);
  });

  it("applies search", () => {
    expect(selectFeed(posts, ctx, { ...base, query: "walk" }).map((p) => p.id)).toEqual(["new", "old"]);
  });

  it("searches comments", () => {
    const commentBodies = (id: string) => (id === "old" ? ["See you at the gate"] : []);
    expect(selectFeed(posts, ctx, { ...base, query: "gate", commentBodies }).map((p) => p.id)).toEqual(["old"]);
  });
});
