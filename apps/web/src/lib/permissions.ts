import type { EventItem } from "../data";

/** Any signed-in member may create events. */
export function canCreateEvent(memberId: string | null): boolean {
  return !!memberId;
}

/** Only the creator or the assigned host may edit/delete an event. */
export function canManageEvent(event: EventItem, memberId: string | null): boolean {
  if (!memberId) return false;
  return event.creatorId === memberId || event.hostId === memberId;
}

/** A wall post can be removed by its author or by the wall owner. */
export function canDeleteWallPost(
  post: { authorId: string; ownerId: string },
  memberId: string | null,
): boolean {
  if (!memberId) return false;
  return post.authorId === memberId || post.ownerId === memberId;
}
