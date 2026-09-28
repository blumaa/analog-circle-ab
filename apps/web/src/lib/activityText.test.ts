import { describe, expect, it } from "vitest";
import { activityFor, activityText, unreadCount } from "./activityText";
import type { Activity, Member } from "../data/types";

const m = (id: string, name: string): Member => ({
  id, name, email: "", photoUrl: null, bio: null, phone: null, whatsappUrl: null,
  social: null, birthday: null, role: "member", joinedAt: "", birthdayPost: true,
});
const members = [m("david", "David Okafor"), m("aaron", "Aaron Blum")];

const a = (over: Partial<Activity>): Activity => ({
  id: "x", type: "post_created", actorId: "david", subjectId: null, targetRoute: "/",
  createdAt: "", readBy: [], ...over,
});

describe("activityText", () => {
  it("uses first names", () => {
    expect(activityText(a({}), members, "aaron")).toBe("David shared a new post");
  });
  it("says 'your' when addressed to viewer", () => {
    expect(activityText(a({ type: "comment", subjectId: "aaron" }), members, "aaron")).toBe("David commented on your post");
    expect(activityText(a({ type: "reply", subjectId: "aaron" }), members, "aaron")).toBe("David replied to your comment");
  });
  it("member joined", () => {
    expect(activityText(a({ type: "member_joined" }), members, "aaron")).toBe("David joined The Analog Circle");
  });
  it("falls back to Someone", () => {
    expect(activityText(a({ actorId: "gone" }), members, "aaron")).toBe("Someone shared a new post");
  });
});

describe("activityFor / unreadCount", () => {
  const list = [
    a({ id: "1" }),
    a({ id: "2", subjectId: "aaron", readBy: ["aaron"] }),
    a({ id: "3", subjectId: "vki" }),
    a({ id: "4", actorId: "aaron" }),
  ];
  it("keeps broadcast and addressed-to-viewer, drops own and others'", () => {
    expect(activityFor(list, "aaron").map((x) => x.id)).toEqual(["1", "2"]);
  });
  it("counts unread", () => {
    expect(unreadCount(list, "aaron")).toBe(1);
  });
});
