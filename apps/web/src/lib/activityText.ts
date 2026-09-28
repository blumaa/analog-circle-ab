import type { Activity, Member } from "../data/types";
import { firstName } from "./names";

/** Sentence for one notification. SSOT for the notifications sheet. */
export function activityText(activity: Activity, members: Member[], viewerId: string): string {
  const actor = members.find((m) => m.id === activity.actorId);
  const name = actor ? firstName(actor.name) : "Someone";
  const yours = activity.subjectId === viewerId;
  switch (activity.type) {
    case "post_created":
      return `${name} shared a new post`;
    case "comment":
      return yours ? `${name} commented on your post` : `${name} commented on a post`;
    case "reply":
      return yours ? `${name} replied to your comment` : `${name} replied to a comment`;
    case "member_joined":
      return `${name} joined The Analog Circle`;
  }
}

/** Activity this viewer should see: addressed to them or to everyone, never their own. */
export function activityFor(activity: Activity[], viewerId: string): Activity[] {
  return activity.filter(
    (a) => a.actorId !== viewerId && (a.subjectId === null || a.subjectId === viewerId),
  );
}

export function unreadCount(activity: Activity[], viewerId: string): number {
  return activityFor(activity, viewerId).filter((a) => !a.readBy.includes(viewerId)).length;
}
