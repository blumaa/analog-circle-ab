import { describe, expect, it } from "vitest";
import { birthdayPostId, birthdayPostsDue } from "./birthday";
import type { Member } from "../data/types";

const member = (id: string, birthday: string | null, birthdayPost = true): Member => ({
  id, name: `${id.charAt(0).toUpperCase()}${id.slice(1)} Surname`, email: "", photoUrl: null, bio: null, phone: null,
  whatsappUrl: null, social: null, birthday, role: "member", joinedAt: "2026-01-01T00:00:00.000Z", birthdayPost,
});

const today = new Date(2026, 9, 17); // 17 Oct 2026

describe("birthdayPostsDue", () => {
  it("creates one post per member whose birthday is today", () => {
    const due = birthdayPostsDue([member("cemre", "1990-10-17"), member("bo", "1990-10-18")], new Set(), today);
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      id: birthdayPostId("cemre", 2026),
      type: "birthday",
      title: "HBD Cemre!",
      celebrantId: "cemre",
      publishedTo: ["square"],
    });
  });

  it("skips members who turned the birthday post off", () => {
    expect(birthdayPostsDue([member("cemre", "1990-10-17", false)], new Set(), today)).toEqual([]);
  });

  it("skips posts that already exist this year", () => {
    const existing = new Set([birthdayPostId("cemre", 2026)]);
    expect(birthdayPostsDue([member("cemre", "1990-10-17")], existing, today)).toEqual([]);
  });
});
