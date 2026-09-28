import { describe, expect, it } from "vitest";
import type { Circle, Post } from "../data/types";
import { toIsoDate } from "./dates";
import { eventsByDay, eventTone, monthGrid } from "./calendar";

const circle = (id: string, type: Circle["type"], memberIds: string[]): Circle => ({
  id, type, name: id, description: "", number: null, imageUrl: null, createdBy: "x", createdAt: "", memberIds,
});

const event = (id: string, date: string | null, publishedTo: string[], type: Post["type"] = "event"): Post => ({
  id, type, title: id, body: "", imageUrl: null, authorId: "someone", publishedTo, createdAt: "2026-01-01T00:00:00Z",
  updatedAt: null, pinned: false, reactions: {}, commentCount: 0, celebrantId: null,
  event: type === "event"
    ? { date, startTime: null, endTime: null, address: null, addressVisible: false, canBringFriend: false, guestLimit: null }
    : null,
});

const circles = [circle("ic4", "inner", ["me"]), circle("padel", "interest", ["me"]), circle("ic1", "inner", ["other"])];

describe("monthGrid", () => {
  it("covers the month in Monday-start weeks", () => {
    const weeks = monthGrid(new Date(2026, 9, 15));
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(toIsoDate(weeks[0]![0]!)).toBe("2026-09-28");
    expect(toIsoDate(weeks[4]![6]!)).toBe("2026-11-01");
  });

  it("starts on the 1st when the month begins on Monday", () => {
    const weeks = monthGrid(new Date(2026, 5, 1));
    expect(toIsoDate(weeks[0]![0]!)).toBe("2026-06-01");
  });
});

describe("eventTone", () => {
  it("is myCircle for the viewer's inner circle, circle for other circles, public otherwise", () => {
    expect(eventTone(event("a", null, ["ic4"]), "me", circles)).toBe("myCircle");
    expect(eventTone(event("b", null, ["padel"]), "me", circles)).toBe("circle");
    expect(eventTone(event("c", null, ["square"]), "me", circles)).toBe("public");
  });
});

describe("eventsByDay", () => {
  it("groups visible dated events by day", () => {
    const posts = [
      event("a", "2026-10-09", ["ic4"]),
      event("b", "2026-10-09", ["square"]),
      event("hidden", "2026-10-09", ["ic1"]),
      event("undated", null, ["square"]),
      event("note", null, ["square"], "post"),
    ];
    const byDay = eventsByDay(posts, "me", circles);
    expect(byDay.get("2026-10-09")?.map((p) => p.id)).toEqual(["a", "b"]);
    expect(byDay.size).toBe(1);
  });
});
