import { describe, expect, it } from "vitest";
import { canDeleteComment, canEditCircle, canDeletePost, canEditComment, canEditPost, isAdmin } from "./permissions";
import type { Member } from "../data/types";

const viewer = (id: string, role: Member["role"] = "member") => ({ id, role });
const post = { authorId: "a", type: "event" as const };
const comment = { authorId: "a" };

describe("permissions", () => {
  it("isAdmin", () => {
    expect(isAdmin(viewer("x", "admin"))).toBe(true);
    expect(isAdmin(viewer("x"))).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it("only author edits a post", () => {
    expect(canEditPost(post, viewer("a"))).toBe(true);
    expect(canEditPost(post, viewer("b", "admin"))).toBe(false);
    expect(canEditPost(post, null)).toBe(false);
  });

  it("automated birthday posts are not editable", () => {
    expect(canEditPost({ authorId: "a", type: "birthday" }, viewer("a"))).toBe(false);
  });

  it("author or admin deletes a post", () => {
    expect(canDeletePost(post, viewer("a"))).toBe(true);
    expect(canDeletePost(post, viewer("b", "admin"))).toBe(true);
    expect(canDeletePost(post, viewer("b"))).toBe(false);
    expect(canDeletePost(post, null)).toBe(false);
  });

  it("only author edits a comment", () => {
    expect(canEditComment(comment, viewer("a"))).toBe(true);
    expect(canEditComment(comment, viewer("b", "admin"))).toBe(false);
  });

  it("author or admin deletes a comment", () => {
    expect(canDeleteComment(comment, viewer("a"))).toBe(true);
    expect(canDeleteComment(comment, viewer("b", "admin"))).toBe(true);
    expect(canDeleteComment(comment, viewer("b"))).toBe(false);
  });
});

describe("canEditCircle", () => {
  it("allows the creator and admins", () => {
    const circle = { createdBy: "maker" };
    expect(canEditCircle(circle, viewer("maker"))).toBe(true);
    expect(canEditCircle(circle, viewer("x", "admin"))).toBe(true);
    expect(canEditCircle(circle, viewer("x"))).toBe(false);
  });
});
