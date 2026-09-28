import { describe, expect, it } from "vitest";
import type { EventDetails, Post, Rsvp } from "../data/types";
import { mapUrl, rsvpStatus, spotsLine, upcomingEvents } from "./events";

const details = (patch: Partial<EventDetails>): EventDetails => ({
  date: null, startTime: null, endTime: null, address: null, addressVisible: true, canBringFriend: false, guestLimit: null,
  ...patch,
});

describe("spotsLine", () => {
  it("counts spots left and notes friends", () => {
    expect(spotsLine(details({ guestLimit: 10, canBringFriend: true }), 7)).toBe("3 spots left of 10 · friends welcome");
    expect(spotsLine(details({ guestLimit: 10 }), 9)).toBe("1 spot left of 10");
    expect(spotsLine(details({ guestLimit: 10 }), 12)).toBe("Full · 10 places");
  });

  it("drops the limit when there isn't one", () => {
    expect(spotsLine(details({ canBringFriend: true }), 3)).toBe("Friends welcome");
    expect(spotsLine(details({}), 3)).toBeNull();
  });
});

describe("rsvpStatus", () => {
  const rsvps: Rsvp[] = [
    { postId: "p", memberId: "me", status: "declined", updatedAt: "" },
    { postId: "q", memberId: "me", status: "going", updatedAt: "" },
  ];
  it("finds the member's answer for a post", () => {
    expect(rsvpStatus("p", "me", rsvps)).toBe("declined");
    expect(rsvpStatus("q", "me", rsvps)).toBe("going");
    expect(rsvpStatus("r", "me", rsvps)).toBeNull();
  });
});

describe("mapUrl", () => {
  it("links a map search for the address", () => {
    expect(mapUrl("Oranienstraße 25, Berlin")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Oranienstra%C3%9Fe%2025%2C%20Berlin",
    );
  });
});

describe("upcomingEvents", () => {
  const post = (id: string, date: string | null, type: Post["type"] = "event") =>
    ({ id, type, event: type === "event" ? details({ date }) : null }) as Post;

  it("keeps events from today on, soonest first", () => {
    const posts = [post("later", "2026-10-20"), post("past", "2026-09-01"), post("today", "2026-10-01"), post("tbd", null), post("note", null, "post")];
    expect(upcomingEvents(posts, "2026-10-01").map((p) => p.id)).toEqual(["today", "later"]);
  });
});
