import { describe, expect, it, beforeEach } from "vitest";
import { createMockDataSource } from "./mockDataSource";

// mockDataSource uses localStorage, which is available in jsdom.
beforeEach(() => {
  localStorage.clear();
});

describe("createWallPost with mentions", () => {
  it("returns the post with the mentions array", async () => {
    const ds = createMockDataSource();
    const post = await ds.createWallPost({
      ownerId: "aaron",
      authorId: "david",
      scope: "analog",
      body: "Hey @Vki and @Kasey!",
      imageUrl: null,
      likedBy: [],
      replies: [],
      mentions: ["vki", "kasey"],
    });
    expect(post.mentions).toEqual(["vki", "kasey"]);
  });

  it("appends one mention activity per tagged member (skips self)", async () => {
    const ds = createMockDataSource();
    const before = await ds.listActivity();
    await ds.createWallPost({
      ownerId: "aaron",
      authorId: "david",
      scope: "analog",
      body: "@David @Vki",
      imageUrl: null,
      likedBy: [],
      replies: [],
      // david is the author — should be skipped
      mentions: ["david", "vki"],
    });
    const after = await ds.listActivity();
    const newActivities = after.filter((a) => !before.find((b) => b.id === a.id));
    // wall_post activity + 1 mention (vki); david skipped as self
    const mentionActs = newActivities.filter((a) => a.type === "mention");
    expect(mentionActs).toHaveLength(1);
    expect(mentionActs[0]).toMatchObject({
      type: "mention",
      actorId: "david",
      subjectId: "vki",
      scope: "analog",
    });
  });

  it("does not append any mention activity when mentions is empty", async () => {
    const ds = createMockDataSource();
    const before = await ds.listActivity();
    await ds.createWallPost({
      ownerId: "aaron",
      authorId: "david",
      scope: "analog",
      body: "Just a plain post",
      imageUrl: null,
      likedBy: [],
      replies: [],
      mentions: [],
    });
    const after = await ds.listActivity();
    const mentionActs = after.filter(
      (a) => !before.find((b) => b.id === a.id) && a.type === "mention",
    );
    expect(mentionActs).toHaveLength(0);
  });

  it("reads posts back with mentions field (back-compat: returns [] when missing)", async () => {
    const ds = createMockDataSource();
    // The seeded wall-1 has mentions: [] set.
    const posts = await ds.listWallPosts("aaron");
    expect(posts.every((p) => Array.isArray(p.mentions))).toBe(true);
  });
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

describe("toggleWallPostLike", () => {
  it("adds the member when not already in likedBy", async () => {
    const ds = createMockDataSource();
    const updated = await ds.toggleWallPostLike("wall-1", "aaron");
    expect(updated.likedBy).toContain("aaron");
  });

  it("removes the member when already in likedBy", async () => {
    const ds = createMockDataSource();
    // wall-1 is seeded with "vki" liked.
    const updated = await ds.toggleWallPostLike("wall-1", "vki");
    expect(updated.likedBy).not.toContain("vki");
  });

  it("toggles idempotently across two calls", async () => {
    const ds = createMockDataSource();
    const after1 = await ds.toggleWallPostLike("wall-1", "aaron");
    expect(after1.likedBy.filter((id) => id === "aaron")).toHaveLength(1);
    const after2 = await ds.toggleWallPostLike("wall-1", "aaron");
    expect(after2.likedBy).not.toContain("aaron");
  });

  it("rejects for a non-existent post", async () => {
    const ds = createMockDataSource();
    let caught: unknown;
    try {
      await ds.toggleWallPostLike("nonexistent", "david");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(Error);
  });
});
