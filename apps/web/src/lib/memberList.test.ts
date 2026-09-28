import { describe, expect, it } from "vitest";
import type { Circle, Member } from "../data/types";
import { activeMemberFilterCount, EMPTY_MEMBER_FILTER, selectMembers, type MemberQuery } from "./memberList";

const member = (id: string, name: string, joinedAt: string, bio: string | null = null): Member => ({
  id, name, email: `${id}@example.com`, photoUrl: null, bio, phone: null, whatsappUrl: null,
  social: null, birthday: null, role: "member", joinedAt, birthdayPost: true,
});

const circle = (id: string, type: Circle["type"], number: number | null, memberIds: string[]): Circle => ({
  id, type, name: id, description: "", number, imageUrl: null, createdBy: "x", createdAt: "", memberIds,
});

const members = [
  member("zoe", "Zoe Adams", "2026-03-01T00:00:00Z", "Loves synths"),
  member("ada", "Ada Byrne", "2026-01-01T00:00:00Z"),
  member("max", "Max Cole", "2026-02-01T00:00:00Z"),
];

const circles = [
  circle("ic2", "inner", 2, ["zoe"]),
  circle("ic1", "inner", 1, ["max"]),
  circle("padel", "interest", null, ["ada", "zoe"]),
];

const base: MemberQuery = { query: "", filter: EMPTY_MEMBER_FILTER, sort: { by: "name", order: "asc" } };
const ids = (q: Partial<MemberQuery>) => selectMembers(members, circles, { ...base, ...q }).map((m) => m.id);

describe("selectMembers", () => {
  it("sorts by name, newest or inner circle, members without one last", () => {
    expect(ids({})).toEqual(["ada", "max", "zoe"]);
    expect(ids({ sort: { by: "name", order: "desc" } })).toEqual(["zoe", "max", "ada"]);
    expect(ids({ sort: { by: "newest", order: "desc" } })).toEqual(["zoe", "max", "ada"]);
    expect(ids({ sort: { by: "innerCircle", order: "asc" } })).toEqual(["max", "zoe", "ada"]);
  });

  it("searches name and bio", () => {
    expect(ids({ query: "cole" })).toEqual(["max"]);
    expect(ids({ query: "SYNTH" })).toEqual(["zoe"]);
    expect(ids({ query: "ada@" })).toEqual([]);
  });

  it("searches email too when asked (admin)", () => {
    expect(ids({ query: "ada@example", searchEmail: true })).toEqual(["ada"]);
  });

  it("filters by inner circle and by circle membership", () => {
    expect(ids({ filter: { innerCircleIds: ["ic1", "ic2"], circleIds: [] } })).toEqual(["max", "zoe"]);
    expect(ids({ filter: { innerCircleIds: [], circleIds: ["padel"] } })).toEqual(["ada", "zoe"]);
    expect(ids({ filter: { innerCircleIds: ["ic2"], circleIds: ["padel"] } })).toEqual(["zoe"]);
  });

  it("counts each selected filter", () => {
    expect(activeMemberFilterCount(EMPTY_MEMBER_FILTER)).toBe(0);
    expect(activeMemberFilterCount({ innerCircleIds: ["ic1"], circleIds: ["a", "b"] })).toBe(3);
  });
});
