import { describe, expect, it } from "vitest";
import type { Circle } from "../data/types";
import { activeCircleFilterCount, EMPTY_CIRCLE_FILTER, selectCircles, type CircleQuery } from "./circleList";

const circle = (over: Partial<Circle> & Pick<Circle, "id" | "name">): Circle => ({
  type: "interest",
  description: "",
  number: null,
  imageUrl: null,
  createdBy: "x",
  createdAt: "2026-01-01T00:00:00Z",
  memberIds: [],
  ...over,
});

const circles = [
  circle({ id: "ic1", name: "Inner Circle 1", type: "inner", number: 1, memberIds: ["a", "b"], createdAt: "2026-01-01T00:00:00Z" }),
  circle({ id: "book", name: "Book Club", description: "One novel a month", memberIds: ["a"], createdAt: "2026-03-01T00:00:00Z" }),
  circle({ id: "padel", name: "Padel Crew", memberIds: ["b", "c", "d"], createdAt: "2026-02-01T00:00:00Z" }),
  circle({ id: "kreuz", name: "Kreuzberg", type: "location", memberIds: [], createdAt: "2026-04-01T00:00:00Z" }),
];

const base: CircleQuery = {
  tab: "all",
  query: "",
  filter: EMPTY_CIRCLE_FILTER,
  sort: { by: "name", order: "asc" },
  viewerId: "a",
};
const ids = (q: Partial<CircleQuery>) => selectCircles(circles, { ...base, ...q }).map((c) => c.id);

describe("selectCircles", () => {
  it("filters by type tab", () => {
    expect(ids({ tab: "interest" })).toEqual(["book", "padel"]);
    expect(ids({ tab: "inner" })).toEqual(["ic1"]);
  });

  it("searches name and description, case-insensitive", () => {
    expect(ids({ query: "NOVEL" })).toEqual(["book"]);
    expect(ids({ query: "crew" })).toEqual(["padel"]);
  });

  it("filters to my circles", () => {
    expect(ids({ filter: { mineOnly: true } })).toEqual(["book", "ic1"]);
  });

  it("sorts by name, members and newest in either order", () => {
    expect(ids({})).toEqual(["book", "ic1", "kreuz", "padel"]);
    expect(ids({ sort: { by: "name", order: "desc" } })).toEqual(["padel", "kreuz", "ic1", "book"]);
    expect(ids({ sort: { by: "members", order: "desc" } })).toEqual(["padel", "ic1", "book", "kreuz"]);
    expect(ids({ sort: { by: "newest", order: "desc" } })).toEqual(["kreuz", "book", "padel", "ic1"]);
  });

  it("counts active filters", () => {
    expect(activeCircleFilterCount(EMPTY_CIRCLE_FILTER)).toBe(0);
    expect(activeCircleFilterCount({ mineOnly: true })).toBe(1);
  });
});
