import type { EventDetails, Post, Rsvp, RsvpStatus } from "../data/types";

/** "3 spots left of 10 · friends welcome", from Guest limit and Can bring a friend. Null when neither is set. */
export function spotsLine(event: Pick<EventDetails, "guestLimit" | "canBringFriend">, goingCount: number): string | null {
  const parts: string[] = [];
  if (event.guestLimit != null) {
    const left = event.guestLimit - goingCount;
    parts.push(
      left > 0
        ? `${left} ${left === 1 ? "spot" : "spots"} left of ${event.guestLimit}`
        : `Full · ${event.guestLimit} places`,
    );
  }
  if (event.canBringFriend) parts.push(parts.length ? "friends welcome" : "Friends welcome");
  return parts.length ? parts.join(" · ") : null;
}

export function rsvpStatus(postId: string, memberId: string, rsvps: Rsvp[]): RsvpStatus | null {
  return rsvps.find((r) => r.postId === postId && r.memberId === memberId)?.status ?? null;
}

/** Map search link for an address (Google Maps URL API). */
export function mapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/** Dated events on or after `today` (ISO day), soonest first. */
export function upcomingEvents(posts: Post[], today: string): Post[] {
  return posts
    .filter((p) => p.type === "event" && !!p.event?.date && p.event.date >= today)
    .toSorted((a, b) => a.event!.date!.localeCompare(b.event!.date!));
}
