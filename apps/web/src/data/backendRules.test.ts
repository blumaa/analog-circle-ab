import { describe, expect, it } from "vitest";
import type { Comment, Post, PostInput } from "./types";
import { buildPost, commentActivity, isSelfAddressed, postRoute, replyParentId } from "./backendRules";

const input: PostInput = {
  type: "post",
  title: "Hi",
  body: "",
  imageUrl: null,
  authorId: "aaron",
  publishedTo: ["square"],
  event: null,
};

const post = (patch: Partial<Post> = {}): Post => ({ ...buildPost(input, "p1", "2026-09-28T10:00:00.000Z"), ...patch });

const comment = (patch: Partial<Comment> = {}): Comment => ({
  id: "c1", postId: "p1", parentId: null, authorId: "bo", body: "", createdAt: "", updatedAt: null, reactions: {}, ...patch,
});

describe("buildPost", () => {
  it("fills server-owned fields", () => {
    expect(buildPost(input, "p1", "2026-09-28T10:00:00.000Z")).toEqual({
      ...input,
      id: "p1",
      createdAt: "2026-09-28T10:00:00.000Z",
      updatedAt: null,
      pinned: false,
      reactions: {},
      commentCount: 0,
      celebrantId: null,
    });
  });
});

describe("postRoute", () => {
  it("links events to the event page and every other post to the post page", () => {
    expect(postRoute(post({ type: "event" }))).toBe("/events/p1");
    expect(postRoute(post({ publishedTo: ["square", "padel"] }))).toBe("/posts/p1");
    expect(postRoute(post({ type: "birthday" }))).toBe("/posts/p1");
  });
});

describe("replyParentId", () => {
  it("keeps replies one level deep", () => {
    expect(replyParentId(null)).toBeNull();
    expect(replyParentId(comment({ id: "top" }))).toBe("top");
    expect(replyParentId(comment({ id: "r1", parentId: "top" }))).toBe("top");
  });
});

describe("commentActivity", () => {
  it("addresses a top-level comment to the post author", () => {
    expect(commentActivity(post(), null, "bo")).toEqual({
      type: "comment", actorId: "bo", subjectId: "aaron", targetRoute: "/posts/p1",
    });
  });

  it("addresses a reply to the parent comment author", () => {
    expect(commentActivity(post(), comment({ authorId: "cy" }), "bo")).toEqual({
      type: "reply", actorId: "bo", subjectId: "cy", targetRoute: "/posts/p1",
    });
  });
});

describe("isSelfAddressed", () => {
  it("is true only when the subject is the actor", () => {
    expect(isSelfAddressed({ actorId: "a", subjectId: "a" })).toBe(true);
    expect(isSelfAddressed({ actorId: "a", subjectId: "b" })).toBe(false);
    expect(isSelfAddressed({ actorId: "a", subjectId: null })).toBe(false);
  });
});
