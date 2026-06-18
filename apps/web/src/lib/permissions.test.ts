import { describe, expect, it } from "vitest";
import { canCreateEvent, canManageEvent, canDeleteWallPost } from "./permissions";
import type { EventItem } from "../data";

const event: EventItem = {
  id: "e1",
  scope: "inner",
  groupId: "ic4",
  title: "Meeting",
  date: "2026-07-04",
  startTime: "16:00",
  endTime: "19:00",
  hostId: "david",
  creatorId: "aaron",
  address: null,
  guideUrl: null,
  type: "meeting",
};

describe("permissions", () => {
  it("any signed-in member can create events", () => {
    expect(canCreateEvent("aaron")).toBe(true);
    expect(canCreateEvent(null)).toBe(false);
  });

  it("creator or host can manage an event", () => {
    expect(canManageEvent(event, "aaron")).toBe(true); // creator
    expect(canManageEvent(event, "david")).toBe(true); // host
    expect(canManageEvent(event, "vki")).toBe(false);
    expect(canManageEvent(event, null)).toBe(false);
  });

  it("wall post deletable by author or wall owner", () => {
    const post = { authorId: "david", ownerId: "aaron" };
    expect(canDeleteWallPost(post, "david")).toBe(true); // author
    expect(canDeleteWallPost(post, "aaron")).toBe(true); // owner
    expect(canDeleteWallPost(post, "vki")).toBe(false);
  });
});
