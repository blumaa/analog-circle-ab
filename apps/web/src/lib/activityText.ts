import type { Activity, Member } from "../data/types";

/**
 * Builds the human-readable sentence for an Activity record.
 * SSOT: used by NotificationItem and WallPostCard (activity mode).
 */
export function activityText(
  activity: Activity,
  members: Member[],
  currentMemberId: string,
): string {
  const actor = members.find((m) => m.id === activity.actorId);
  const actorName = actor?.name ?? "Someone";

  switch (activity.type) {
    case "wall_post": {
      if (activity.subjectId === currentMemberId) {
        return `${actorName} wrote on your wall`;
      }
      const subject = members.find((m) => m.id === activity.subjectId);
      const subjectName = subject?.name ?? "a member";
      return `${actorName} wrote on ${subjectName}’s wall`;
    }
    case "event_created":
      return `${actorName} created an event`;
    case "member_joined":
      return `${actorName} joined the ${
        activity.scope === "inner" ? "Inner Circle" : "Analog Circle"
      }`;
    case "loop_post":
      return `${actorName} posted to The Loop`;
    case "mention": {
      if (activity.subjectId === currentMemberId) {
        return `${actorName} tagged you in a post`;
      }
      const subject = members.find((m) => m.id === activity.subjectId);
      const subjectName = subject?.name ?? "a member";
      return `${actorName} tagged ${subjectName} in a post`;
    }
  }
}
