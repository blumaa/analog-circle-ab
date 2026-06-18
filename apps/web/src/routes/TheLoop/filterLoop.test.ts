import { describe, expect, it } from "vitest";
import { filterLoopPosts } from "./filterLoop";
import type { LoopPost } from "../../data";

const base = (overrides: Partial<LoopPost> = {}): LoopPost => ({
  id: "1",
  scope: "analog",
  kind: "need",
  category: "Housing",
  body: "I need a room",
  authorId: "u1",
  archived: false,
  createdAt: "2026-01-01T00:00:00Z",
  notes: [],
  helpedBy: [],
  ...overrides,
});

const resolver = (id: string) => (id === "u1" ? "Alice" : "Bob");

describe("filterLoopPosts", () => {
  describe("kind filter", () => {
    it("all: shows only non-archived posts", () => {
      const posts = [
        base({ id: "1", archived: false }),
        base({ id: "2", archived: true }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "all", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("need: shows non-archived needs", () => {
      const posts = [
        base({ id: "1", kind: "need", archived: false }),
        base({ id: "2", kind: "offer", archived: false }),
        base({ id: "3", kind: "need", archived: true }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "need", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("offer: shows non-archived offers", () => {
      const posts = [
        base({ id: "1", kind: "need", archived: false }),
        base({ id: "2", kind: "offer", archived: false }),
        base({ id: "3", kind: "offer", archived: true }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "offer", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["2"]);
    });

    it("archived: shows only archived posts", () => {
      const posts = [
        base({ id: "1", archived: false }),
        base({ id: "2", archived: true }),
        base({ id: "3", archived: true }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "archived", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["2", "3"]);
    });
  });

  describe("category filter", () => {
    it("filters by exact category", () => {
      const posts = [
        base({ id: "1", category: "Housing" }),
        base({ id: "2", category: "Food" }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "all", category: "Housing" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("all categories: does not filter by category", () => {
      const posts = [
        base({ id: "1", category: "Housing" }),
        base({ id: "2", category: "Food" }),
      ];
      const result = filterLoopPosts(posts, { query: "", kind: "all", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1", "2"]);
    });
  });

  describe("query search", () => {
    it("matches body text (case-insensitive)", () => {
      const posts = [
        base({ id: "1", body: "I need a room" }),
        base({ id: "2", body: "Offering cooking classes" }),
      ];
      const result = filterLoopPosts(posts, { query: "cooking", kind: "all", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["2"]);
    });

    it("matches category (case-insensitive)", () => {
      const posts = [
        base({ id: "1", category: "Housing" }),
        base({ id: "2", category: "Food" }),
      ];
      const result = filterLoopPosts(posts, { query: "hous", kind: "all", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("matches authorName via resolver", () => {
      const posts = [
        base({ id: "1", authorId: "u1" }),
        base({ id: "2", authorId: "u2" }),
      ];
      const result = filterLoopPosts(posts, { query: "alice", kind: "all", category: "all categories" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });

    it("empty query returns all (after other filters)", () => {
      const posts = [base({ id: "1" }), base({ id: "2" })];
      const result = filterLoopPosts(posts, { query: "", kind: "all", category: "all categories" }, resolver);
      expect(result).toHaveLength(2);
    });
  });

  describe("combined filters", () => {
    it("applies kind + category + query together", () => {
      const posts = [
        base({ id: "1", kind: "need", category: "Housing", body: "urgent room" }),
        base({ id: "2", kind: "offer", category: "Housing", body: "room available" }),
        base({ id: "3", kind: "need", category: "Food", body: "urgent food" }),
      ];
      const result = filterLoopPosts(posts, { query: "urgent", kind: "need", category: "Housing" }, resolver);
      expect(result.map((p) => p.id)).toEqual(["1"]);
    });
  });
});
