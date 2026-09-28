import { describe, expect, it } from "vitest";
import { addMemberToCircle, canPublishTo, innerCircleOf } from "./circles";
import type { Circle } from "../data/types";

const circle = (id: string, type: Circle["type"], memberIds: string[], number: number | null = null): Circle => ({
  id, type, name: id, description: "", number, imageUrl: null, createdBy: "x", createdAt: "", memberIds,
});

describe("innerCircleOf", () => {
  it("finds member's inner circle, ignoring other types", () => {
    const cs = [circle("hike", "interest", ["a"]), circle("ic2", "inner", ["a"], 2)];
    expect(innerCircleOf(cs, "a")?.id).toBe("ic2");
    expect(innerCircleOf(cs, "z")).toBeNull();
  });
});

describe("addMemberToCircle", () => {
  it("adds once", () => {
    const cs = [circle("hike", "interest", ["a"])];
    expect(addMemberToCircle(cs, "hike", "a")[0]?.memberIds).toEqual(["a"]);
    expect(addMemberToCircle(cs, "hike", "b")[0]?.memberIds).toEqual(["a", "b"]);
  });
  it("moves member out of other inner circles when joining an inner circle", () => {
    const cs = [circle("ic1", "inner", ["a"], 1), circle("ic2", "inner", [], 2), circle("hike", "interest", ["a"])];
    const next = addMemberToCircle(cs, "ic2", "a");
    expect(next.map((c) => c.memberIds)).toEqual([[], ["a"], ["a"]]);
  });
});

describe("canPublishTo", () => {
  const cs = [circle("hike", "interest", ["a"]), circle("books", "interest", ["b"])];
  it("allows the public feeds and circles the member belongs to", () => {
    expect(canPublishTo(cs, "a", "square")).toBe(true);
    expect(canPublishTo(cs, "a", "loop")).toBe(true);
    expect(canPublishTo(cs, "a", "hike")).toBe(true);
  });
  it("refuses circles the member is not in, and unknown targets", () => {
    expect(canPublishTo(cs, "a", "books")).toBe(false);
    expect(canPublishTo(cs, "a", "gone")).toBe(false);
  });
});
