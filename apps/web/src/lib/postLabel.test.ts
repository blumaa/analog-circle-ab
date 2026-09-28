import { describe, expect, it } from "vitest";
import type { Circle, Post } from "../data/types";
import { postAudience, postTag, postTone, POST_TYPE_LABEL } from "./postLabel";

const circle = (id: string, type: Circle["type"], name: string, memberIds: string[]): Circle => ({
  id, type, name, description: "", number: type === "inner" ? 4 : null, imageUrl: null,
  createdBy: "x", createdAt: "2026-01-01T00:00:00Z", memberIds,
});
const circles = [circle("ic4", "inner", "IC4", ["me"]), circle("padel", "interest", "Padel", ["me"])];
const post = (type: Post["type"], publishedTo: string[]): Post => ({
  id: "p", type, title: "t", body: "", imageUrl: null, authorId: "a", publishedTo, createdAt: "", updatedAt: null,
  pinned: false, reactions: {}, commentCount: 0, event: null, celebrantId: null,
});

describe("postLabel", () => {
  it("names the viewer's inner circle My Circle", () => {
    expect(postAudience(post("event", ["ic4"]), circles, "me")).toBe("My Circle");
    expect(postTag(post("event", ["ic4"]), circles, "me")).toBe("Event · My Circle");
  });

  it("names a single other circle, The Loop, or nothing for the Square", () => {
    expect(postAudience(post("post", ["padel"]), circles, "me")).toBe("Padel");
    expect(postAudience(post("post", ["loop"]), circles, "me")).toBe("The Loop");
    expect(postAudience(post("event", ["square"]), circles, "me")).toBeNull();
    expect(postTag(post("event", ["square"]), circles, "me")).toBe("Event");
  });

  it("birthday posts have no audience and a pink tone", () => {
    expect(postTag(post("birthday", ["square"]), circles, "me")).toBe("Birthday");
    expect(postTone("birthday")).toBe("pink");
    expect(postTone("offer")).toBe("green");
    expect(postTone("event")).toBe("gold");
    expect(POST_TYPE_LABEL.need).toBe("Need");
  });
});
