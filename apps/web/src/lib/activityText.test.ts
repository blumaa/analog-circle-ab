import { describe, expect, it } from "vitest";
import { activityText } from "./activityText";
import type { Activity, Member } from "../data/types";

const members: Member[] = [
  {
    id: "david",
    name: "David",
    email: "david@example.com",
    photoUrl: null,
    from: null,
    bio: null,
    interests: [],
    dietary: null,
    whatsappUrl: null,
    homeAddress: null,
    location: null,
  },
  {
    id: "aaron",
    name: "Aaron Blum",
    email: "aaron@example.com",
    photoUrl: null,
    from: null,
    bio: null,
    interests: [],
    dietary: null,
    whatsappUrl: null,
    homeAddress: null,
    location: null,
  },
  {
    id: "vki",
    name: "Vki",
    email: "vki@example.com",
    photoUrl: null,
    from: null,
    bio: null,
    interests: [],
    dietary: null,
    whatsappUrl: null,
    homeAddress: null,
    location: null,
  },
];

function makeActivity(over: Partial<Activity>): Activity {
  return {
    id: "a1",
    type: "wall_post",
    scope: "analog",
    actorId: "david",
    subjectId: null,
    targetRoute: "/",
    createdAt: new Date().toISOString(),
    readBy: [],
    ...over,
  };
}

describe("activityText — mention case", () => {
  it("returns 'tagged you in a post' when subjectId === currentMemberId", () => {
    const result = activityText(
      makeActivity({ type: "mention", actorId: "david", subjectId: "aaron" }),
      members,
      "aaron",
    );
    expect(result).toBe("David tagged you in a post");
  });

  it("returns 'tagged <name> in a post' when subjectId !== currentMemberId", () => {
    const result = activityText(
      makeActivity({ type: "mention", actorId: "david", subjectId: "vki" }),
      members,
      "aaron",
    );
    expect(result).toBe("David tagged Vki in a post");
  });

  it("falls back to 'a member' when the subject is unknown", () => {
    const result = activityText(
      makeActivity({ type: "mention", actorId: "david", subjectId: "unknown-id" }),
      members,
      "aaron",
    );
    expect(result).toBe("David tagged a member in a post");
  });

  it("falls back to 'Someone' when the actor is unknown", () => {
    const result = activityText(
      makeActivity({ type: "mention", actorId: "unknown-actor", subjectId: "vki" }),
      members,
      "aaron",
    );
    expect(result).toBe("Someone tagged Vki in a post");
  });
});

describe("activityText — existing types (regression)", () => {
  it("wall_post on your wall", () => {
    expect(
      activityText(
        makeActivity({ type: "wall_post", actorId: "david", subjectId: "aaron" }),
        members,
        "aaron",
      ),
    ).toBe("David wrote on your wall");
  });

  it("wall_post on another member's wall", () => {
    expect(
      activityText(
        makeActivity({ type: "wall_post", actorId: "david", subjectId: "vki" }),
        members,
        "aaron",
      ),
    ).toBe("David wrote on Vki’s wall");
  });

  it("event_created", () => {
    expect(
      activityText(makeActivity({ type: "event_created", actorId: "david" }), members, "aaron"),
    ).toBe("David created an event");
  });

  it("member_joined analog", () => {
    expect(
      activityText(
        makeActivity({ type: "member_joined", actorId: "david", scope: "analog" }),
        members,
        "aaron",
      ),
    ).toBe("David joined the Analog Circle");
  });

  it("loop_post", () => {
    expect(
      activityText(makeActivity({ type: "loop_post", actorId: "david" }), members, "aaron"),
    ).toBe("David posted to The Loop");
  });
});
