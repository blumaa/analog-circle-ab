import { beforeEach, describe, expect, it } from "vitest";
import { createMockDataSource } from "./mockDataSource";
import { createSeed } from "./fixtures";
import type { PostInput } from "../types";

beforeEach(() => {
  localStorage.clear();
});

const input = (over: Partial<PostInput> = {}): PostInput => ({
  type: "post",
  title: "Hello",
  body: "World",
  imageUrl: null,
  authorId: "aaron",
  publishedTo: ["loop"],
  event: null,
  ...over,
});

describe("seed", () => {
  it("every member is in at most one inner circle", () => {
    const { members, circles } = createSeed(new Date(2026, 9, 1));
    for (const m of members) {
      expect(circles.filter((c) => c.type === "inner" && c.memberIds.includes(m.id)).length).toBeLessThanOrEqual(1);
    }
  });
  it("aaron is an admin in IC4", () => {
    const { members, circles } = createSeed();
    expect(members.find((m) => m.id === "aaron")?.role).toBe("admin");
    expect(circles.find((c) => c.id === "ic4")?.memberIds).toContain("aaron");
  });
  it("commentCount matches comments", () => {
    const { posts, comments } = createSeed();
    for (const p of posts) {
      expect(p.commentCount).toBe(comments.filter((c) => c.postId === p.id).length);
    }
  });
});

describe("auth", () => {
  it("signs in by email and out", async () => {
    const ds = createMockDataSource();
    await ds.signOut();
    expect(await ds.getCurrentMemberId()).toBeNull();
    await ds.signInWithEmail("odette@example.com");
    expect(await ds.getCurrentMemberId()).toBe("odette");
    await expect(ds.signInWithEmail("nobody@example.com")).rejects.toThrow();
  });
});

describe("posts", () => {
  it("creates, updates and deletes a post", async () => {
    const ds = createMockDataSource();
    const p = await ds.createPost(input());
    expect(p).toMatchObject({ title: "Hello", pinned: false, commentCount: 0, reactions: {} });
    const u = await ds.updatePost(p.id, { title: "Hi" });
    expect(u.title).toBe("Hi");
    expect(u.updatedAt).not.toBeNull();
    await ds.deletePost(p.id);
    expect((await ds.listPosts()).find((x) => x.id === p.id)).toBeUndefined();
  });

  it("deleting a post removes its comments and rsvps", async () => {
    const ds = createMockDataSource();
    await ds.deletePost("brunch-botanico");
    expect(await ds.listComments("brunch-botanico")).toEqual([]);
    expect((await ds.listRsvps()).some((r) => r.postId === "brunch-botanico")).toBe(false);
  });

  it("creating a post logs activity", async () => {
    const ds = createMockDataSource();
    const p = await ds.createPost(input({ authorId: "david" }));
    const act = await ds.listActivity();
    expect(act.some((a) => a.type === "post_created" && a.actorId === "david" && a.targetRoute.length > 0)).toBe(true);
    expect(p.id).toBeTruthy();
  });

  it("toggles reactions", async () => {
    const ds = createMockDataSource();
    const p = await ds.createPost(input());
    await ds.togglePostReaction(p.id, "david", "🎉");
    let got = (await ds.listPosts()).find((x) => x.id === p.id)!;
    expect(got.reactions).toEqual({ "🎉": ["david"] });
    await ds.togglePostReaction(p.id, "david", "🎉");
    got = (await ds.listPosts()).find((x) => x.id === p.id)!;
    expect(got.reactions).toEqual({});
  });

  it("creates today's birthday post once, unless opted out", async () => {
    const ds = createMockDataSource();
    const first = (await ds.listPosts()).filter((p) => p.celebrantId === "cemre");
    const second = (await ds.listPosts()).filter((p) => p.celebrantId === "cemre");
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0]!.title).toBe("HBD Cemre!");
  });

  it("skips birthday post when celebrant opted out", async () => {
    const ds = createMockDataSource();
    await ds.updateMember("cemre", { birthdayPost: false });
    expect((await ds.listPosts()).some((p) => p.celebrantId === "cemre")).toBe(false);
  });
});

describe("publish scope", () => {
  it("refuses a post to a circle the author is not in", async () => {
    const ds = createMockDataSource();
    await expect(ds.createPost(input({ publishedTo: ["book-club"] }))).rejects.toThrow("book-club");
    const p = await ds.createPost(input({ publishedTo: ["square", "padel"] }));
    await expect(ds.updatePost(p.id, { publishedTo: ["padel", "book-club"] })).rejects.toThrow("book-club");
  });
});

describe("listAllComments", () => {
  it("returns comments across posts", async () => {
    const ds = createMockDataSource();
    const postIds = new Set((await ds.listAllComments()).map((c) => c.postId));
    expect(postIds.has("brunch-botanico") && postIds.has("story-circle-33")).toBe(true);
  });
});

describe("pinning", () => {
  it("admins pin and unpin without marking the post edited", async () => {
    const ds = createMockDataSource();
    const pinned = await ds.setPostPinned("welcome", true);
    expect(pinned).toMatchObject({ pinned: true, updatedAt: null });
    expect((await ds.setPostPinned("welcome", false)).pinned).toBe(false);
  });

  it("refuses members", async () => {
    const ds = createMockDataSource();
    await ds.devSignInAs("vki");
    await expect(ds.setPostPinned("welcome", true)).rejects.toThrow("admin");
  });
});

describe("feedback", () => {
  it("stores trimmed feedback, newest first, and admins delete it", async () => {
    const ds = createMockDataSource();
    const f = await ds.sendFeedback("aaron", "  Love the calendar  ");
    expect(f).toMatchObject({ authorId: "aaron", body: "Love the calendar" });
    expect((await ds.listFeedback())[0]!.id).toBe(f.id);
    await ds.deleteFeedback(f.id);
    expect((await ds.listFeedback()).some((x) => x.id === f.id)).toBe(false);
  });

  it("refuses empty feedback and hides the list from members", async () => {
    const ds = createMockDataSource();
    await expect(ds.sendFeedback("aaron", "   ")).rejects.toThrow("empty");
    await ds.devSignInAs("vki");
    await expect(ds.listFeedback()).rejects.toThrow("admin");
  });
});

describe("comments", () => {
  it("adds, edits and deletes with replies; keeps commentCount", async () => {
    const ds = createMockDataSource();
    const p = await ds.createPost(input());
    const top = await ds.addComment(p.id, "david", "First", null);
    await ds.addComment(p.id, "vki", "Reply", top.id);
    expect((await ds.listPosts()).find((x) => x.id === p.id)!.commentCount).toBe(2);
    const edited = await ds.updateComment(top.id, "First!");
    expect(edited.body).toBe("First!");
    expect(edited.updatedAt).not.toBeNull();
    await ds.deleteComment(top.id);
    expect(await ds.listComments(p.id)).toEqual([]);
    expect((await ds.listPosts()).find((x) => x.id === p.id)!.commentCount).toBe(0);
  });

  it("notifies post author on comment and parent author on reply, never self", async () => {
    const ds = createMockDataSource();
    const p = await ds.createPost(input({ authorId: "aaron" }));
    const top = await ds.addComment(p.id, "david", "Hi", null);
    await ds.addComment(p.id, "aaron", "Hey", top.id);
    await ds.addComment(p.id, "aaron", "Self", null);
    const act = await ds.listActivity();
    expect(act.some((a) => a.type === "comment" && a.actorId === "david" && a.subjectId === "aaron")).toBe(true);
    expect(act.some((a) => a.type === "reply" && a.actorId === "aaron" && a.subjectId === "david")).toBe(true);
    expect(act.some((a) => a.actorId === "aaron" && a.subjectId === "aaron")).toBe(false);
  });

  it("toggles comment reactions", async () => {
    const ds = createMockDataSource();
    await ds.toggleCommentReaction("c1", "vki", "😂");
    const c1 = (await ds.listComments("brunch-botanico")).find((c) => c.id === "c1")!;
    expect(c1.reactions["😂"]).toContain("vki");
  });
});

describe("rsvps", () => {
  it("upserts one rsvp per member per post", async () => {
    const ds = createMockDataSource();
    await ds.setRsvp("zine-night", "vki", "going");
    await ds.setRsvp("zine-night", "vki", "declined");
    const mine = (await ds.listRsvps()).filter((r) => r.postId === "zine-night" && r.memberId === "vki");
    expect(mine).toHaveLength(1);
    expect(mine[0]!.status).toBe("declined");
  });
});

describe("circles", () => {
  it("moving a member to another inner circle leaves the old one", async () => {
    const ds = createMockDataSource();
    await ds.addCircleMember("ic1", "aaron");
    const circles = await ds.listCircles();
    expect(circles.find((c) => c.id === "ic1")!.memberIds).toContain("aaron");
    expect(circles.find((c) => c.id === "ic4")!.memberIds).not.toContain("aaron");
  });

  it("creates, updates and deletes a circle", async () => {
    const ds = createMockDataSource();
    const c = await ds.createCircle({ type: "interest", name: "Chess", description: "", number: null, imageUrl: null, createdBy: "aaron" });
    expect(c.memberIds).toEqual(["aaron"]);
    expect((await ds.updateCircle(c.id, { name: "Chess club" })).name).toBe("Chess club");
    await ds.removeCircleMember(c.id, "aaron");
    expect((await ds.listCircles()).find((x) => x.id === c.id)!.memberIds).toEqual([]);
    await ds.deleteCircle(c.id);
    expect((await ds.listCircles()).some((x) => x.id === c.id)).toBe(false);
  });
});

describe("members", () => {
  it("deleting a member removes them from circles", async () => {
    const ds = createMockDataSource();
    await ds.deleteMember("vki");
    expect(await ds.getMember("vki")).toBeNull();
    expect((await ds.listCircles()).some((c) => c.memberIds.includes("vki"))).toBe(false);
  });

  it("creates a member and logs member_joined", async () => {
    const ds = createMockDataSource();
    const m = await ds.createMember({
      name: "New Person", email: "new@example.com", photoUrl: null, bio: null, phone: null,
      whatsappUrl: null, social: null, birthday: null, role: "member",
    });
    expect(await ds.getMember(m.id)).toMatchObject({ name: "New Person", birthdayPost: true });
    expect((await ds.listActivity()).some((a) => a.type === "member_joined" && a.actorId === m.id)).toBe(true);
  });
});

describe("prefs and activity", () => {
  it("returns defaults for members without prefs and merges patches", async () => {
    const ds = createMockDataSource();
    await ds.devSignInAs("vki");
    expect((await ds.getPrefs("vki")).channel).toBe("push");
    const p = await ds.updatePrefs("vki", { channel: "email" });
    expect(p.channel).toBe("email");
    expect((await ds.getPrefs("vki")).channel).toBe("email");
  });

  it("keeps prefs private to the signed-in member", async () => {
    const ds = createMockDataSource();
    await ds.devSignInAs("aaron");
    await expect(ds.getPrefs("vki")).rejects.toThrow("private");
    await expect(ds.updatePrefs("vki", { channel: "email" })).rejects.toThrow("private");
  });

  it("marks activity read", async () => {
    const ds = createMockDataSource();
    await ds.markActivityRead("a1", "aaron");
    expect((await ds.listActivity()).find((a) => a.id === "a1")!.readBy).toContain("aaron");
    await ds.markAllActivityRead("aaron");
    expect((await ds.listActivity()).every((a) => a.readBy.includes("aaron"))).toBe(true);
  });
});

describe("images", () => {
  it("returns an image URL the browser can show", async () => {
    const ds = createMockDataSource();
    const url = await ds.uploadImage(new File(["hi"], "pic.png", { type: "image/png" }));
    expect(url).toBe("data:image/png;base64,aGk=");
  });
});
