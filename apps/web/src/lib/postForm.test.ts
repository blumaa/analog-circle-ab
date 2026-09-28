import { describe, expect, it } from "vitest";
import type { Post } from "../data/types";
import { emptyPostForm, postFormErrors, postFormFromPost, toPostInput, type PostFormValues } from "./postForm";

const valid = (patch: Partial<PostFormValues> = {}): PostFormValues => ({
  ...emptyPostForm(["ic4", "square"]),
  title: "Zine night",
  date: "2026-10-09",
  startTime: "19:00",
  ...patch,
});

describe("emptyPostForm", () => {
  it("starts as an event with the given audience and the date known", () => {
    const form = emptyPostForm(["square"]);
    expect(form.type).toBe("event");
    expect(form.publishedTo).toEqual(["square"]);
    expect(form.when).toBe("date");
    expect(form.canBringFriend).toBe(true);
    expect(form.addressVisible).toBe(false);
  });
});

describe("postFormErrors", () => {
  it("passes a complete event", () => {
    expect(postFormErrors(valid())).toEqual({});
  });

  it("needs a title and somewhere to publish", () => {
    expect(postFormErrors(valid({ title: "  ", publishedTo: [] }))).toEqual({
      title: "Give it a name.",
      publishedTo: "Pick at least one place to publish.",
    });
  });

  it("needs a date and start time only when the date is known", () => {
    expect(postFormErrors(valid({ date: "", startTime: "" }))).toEqual({
      date: "Pick a date.",
      startTime: "Pick a start time.",
    });
    expect(postFormErrors(valid({ when: "group", date: "", startTime: "" }))).toEqual({});
  });

  it("ignores event fields for posts", () => {
    expect(postFormErrors(valid({ type: "post", date: "", startTime: "" }))).toEqual({});
  });

  it("rejects a guest limit below one", () => {
    expect(postFormErrors(valid({ guestLimit: "0" }))).toEqual({ guestLimit: "Use a number above zero, or leave it empty." });
  });
});

describe("toPostInput", () => {
  it("builds an event with trimmed fields", () => {
    const input = toPostInput(valid({ title: " Zine night ", body: " Bring paper ", address: " Oranienstr. 1 ", guestLimit: "8" }), "aaron");
    expect(input).toEqual({
      type: "event",
      title: "Zine night",
      body: "Bring paper",
      imageUrl: null,
      authorId: "aaron",
      publishedTo: ["ic4", "square"],
      event: {
        date: "2026-10-09",
        startTime: "19:00",
        endTime: null,
        address: "Oranienstr. 1",
        addressVisible: false,
        canBringFriend: true,
        guestLimit: 8,
      },
    });
  });

  it("drops date and times when the group picks", () => {
    const input = toPostInput(valid({ when: "group", endTime: "22:00" }), "aaron");
    expect(input.event).toMatchObject({ date: null, startTime: null, endTime: null });
  });

  it("has no event details for posts", () => {
    expect(toPostInput(valid({ type: "post" }), "aaron").event).toBeNull();
  });
});

describe("postFormFromPost", () => {
  it("round-trips an event", () => {
    const post = {
      id: "p", type: "event", title: "Zine night", body: "Bring paper", imageUrl: "pic.jpg", authorId: "aaron",
      publishedTo: ["creative-corner"], createdAt: "", updatedAt: null, pinned: false, reactions: {}, commentCount: 0,
      celebrantId: null,
      event: { date: null, startTime: null, endTime: null, address: null, addressVisible: true, canBringFriend: false, guestLimit: 6 },
    } satisfies Post;
    const form = postFormFromPost(post);
    expect(form).toMatchObject({ when: "group", date: "", guestLimit: "6", address: "", imageUrl: "pic.jpg" });
    expect(toPostInput(form, "aaron")).toEqual({
      type: post.type, title: post.title, body: post.body, imageUrl: post.imageUrl, authorId: "aaron",
      publishedTo: post.publishedTo, event: post.event,
    });
  });
});
