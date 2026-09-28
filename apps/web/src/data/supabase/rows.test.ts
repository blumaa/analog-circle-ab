import { describe, expect, it } from "vitest";
import { fromRow, toRow } from "./rows";

describe("toRow", () => {
  it("renames top-level keys to snake_case", () => {
    expect(toRow({ authorId: "aaron", publishedTo: ["square"], commentCount: 2, title: "Hi" })).toEqual({
      author_id: "aaron",
      published_to: ["square"],
      comment_count: 2,
      title: "Hi",
    });
  });

  it("leaves nested JSON untouched", () => {
    const event = { startTime: "18:00", addressVisible: true };
    const reactions = { "🎉": ["aaron"] };
    expect(toRow({ event, reactions })).toEqual({ event, reactions });
  });

  it("drops undefined values so a patch only sets what it names", () => {
    expect(toRow({ title: "Hi", body: undefined })).toEqual({ title: "Hi" });
  });
});

describe("fromRow", () => {
  it("renames top-level keys to camelCase", () => {
    expect(fromRow({ author_id: "aaron", favourite_post_ids: [], whatsapp_url: null })).toEqual({
      authorId: "aaron",
      favouritePostIds: [],
      whatsappUrl: null,
    });
  });

  it("returns timestamps as UTC ISO strings like the other backends", () => {
    expect(
      fromRow({ created_at: "2026-09-28T12:00:00+00:00", updated_at: null, joined_at: "2026-09-01T08:30:15.5+02:00" }),
    ).toEqual({ createdAt: "2026-09-28T12:00:00.000Z", updatedAt: null, joinedAt: "2026-09-01T06:30:15.500Z" });
  });

  it("round-trips a record", () => {
    const post = { id: "p1", authorId: "aaron", createdAt: "2026-09-28T12:00:00.000Z", event: { startTime: "18:00" } };
    expect(fromRow(toRow(post))).toEqual(post);
  });
});
