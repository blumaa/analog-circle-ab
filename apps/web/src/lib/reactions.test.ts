import { describe, expect, it } from "vitest";
import { reactionSummary, toggleReaction } from "./reactions";

describe("toggleReaction", () => {
  it("adds member to emoji", () => {
    expect(toggleReaction({}, "🎉", "a")).toEqual({ "🎉": ["a"] });
  });
  it("removes member and drops empty emoji", () => {
    expect(toggleReaction({ "🎉": ["a"], "❤️": ["b"] }, "🎉", "a")).toEqual({ "❤️": ["b"] });
  });
  it("does not mutate input", () => {
    const r = { "🎉": ["a"] };
    toggleReaction(r, "🎉", "b");
    expect(r).toEqual({ "🎉": ["a"] });
  });
});

describe("reactionSummary", () => {
  it("lists emoji with counts, most first, and whether viewer reacted", () => {
    expect(reactionSummary({ "❤️": ["b"], "🎉": ["a", "c"] }, "a")).toEqual([
      { emoji: "🎉", count: 2, mine: true },
      { emoji: "❤️", count: 1, mine: false },
    ]);
  });
});
