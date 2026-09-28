import { describe, expect, it } from "vitest";
import type { Circle, Member, Post } from "../data/types";
import { circleMeta, memberMeta, notPlacedCount } from "./adminLabels";

const member = (id: string, role: Member["role"] = "member"): Member => ({
  id, name: id, email: `${id}@example.com`, photoUrl: null, bio: null, phone: null, whatsappUrl: null,
  social: null, birthday: null, role, joinedAt: "2026-03-10T00:00:00Z", birthdayPost: true,
});

const circle = (id: string, type: Circle["type"], memberIds: string[]): Circle => ({
  id, type, name: id, description: "", number: type === "inner" ? 1 : null, imageUrl: null, createdBy: "x",
  createdAt: "", memberIds,
});

const event = (id: string, date: string, publishedTo: string[]): Post => ({
  id, type: "event", title: id, body: "", imageUrl: null, authorId: "x", publishedTo, createdAt: "",
  updatedAt: null, pinned: false, reactions: {}, commentCount: 0, celebrantId: null,
  event: { date, startTime: null, endTime: null, address: null, addressVisible: true, canBringFriend: false, guestLimit: null },
});

describe("memberMeta", () => {
  it("shows email for admins and join month for members", () => {
    expect(memberMeta(member("bo", "admin"))).toBe("Admin · bo@example.com");
    expect(memberMeta(member("al"))).toBe("Member · joined Mar 2026");
  });
});

describe("circleMeta", () => {
  const posts = [event("past", "2026-10-01", ["ic1"]), event("next", "2026-10-23", ["ic1"]), event("later", "2026-11-20", ["ic1"])];

  it("shows inner capacity and the next dinner", () => {
    expect(circleMeta(circle("ic1", "inner", ["a", "b"]), posts, "2026-10-10")).toBe(
      "Inner · 2 of 7 members · next dinner Fri 23 Oct",
    );
  });

  it("shows member count and next event for other circles", () => {
    expect(circleMeta(circle("padel", "interest", ["a"]), posts, "2026-10-10")).toBe("Interest · 1 member");
    expect(circleMeta(circle("padel", "interest", ["a"]), [event("x", "2026-10-12", ["padel"])], "2026-10-10")).toBe(
      "Interest · 1 member · next event Mon 12 Oct",
    );
  });
});

describe("notPlacedCount", () => {
  it("counts members without an inner circle", () => {
    expect(notPlacedCount([member("a"), member("b"), member("c")], [circle("ic1", "inner", ["a"]), circle("p", "interest", ["b"])])).toBe(2);
  });
});
