import { describe, expect, it, beforeEach } from "vitest";
import { createMockDataSource } from "./mockDataSource";

// mockDataSource uses localStorage, which is available in jsdom.
beforeEach(() => {
  localStorage.clear();
});

describe("addLoopNote", () => {
  it("appends a note and adds authorId to helpedBy", async () => {
    const ds = createMockDataSource();
    const posts = await ds.listLoopPosts();
    const loop1 = posts.find((p) => p.id === "loop-1");
    expect(loop1).toBeDefined();
    const initialNoteCount = loop1!.notes.length;

    const updated = await ds.addLoopNote("loop-1", "david", "Happy to help!");
    expect(updated.notes).toHaveLength(initialNoteCount + 1);
    expect(updated.notes[updated.notes.length - 1]).toEqual({
      authorId: "david",
      body: "Happy to help!",
    });
    expect(updated.helpedBy).toContain("david");
  });

  it("deduplicates helpedBy on repeated calls", async () => {
    const ds = createMockDataSource();
    await ds.addLoopNote("loop-1", "david", "First note");
    const updated = await ds.addLoopNote("loop-1", "david", "Second note");
    const davidCount = updated.helpedBy.filter((id) => id === "david").length;
    expect(davidCount).toBe(1);
  });

  it("rejects for a non-existent post", async () => {
    const ds = createMockDataSource();
    let caught: unknown;
    try {
      await ds.addLoopNote("nonexistent", "david", "oops");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
  });
});
