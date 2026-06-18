import { useNavigate } from "react-router-dom";
import { Avatar } from "@analog/ui";
import type { Activity, Member } from "../data/types";
import { relativeTime } from "../lib/relativeTime";
import styles from "./NotificationItem.module.css";

export interface NotificationItemProps {
  activity: Activity;
  members: Member[];
  currentMemberId: string;
  /** Called after navigation to mark this activity read. */
  onRead: () => void;
}

function activityText(
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
      return `${actorName} created a meeting`;
    case "member_joined":
      return `${actorName} joined the ${
        activity.scope === "inner" ? "Inner Circle" : "Analog Circle"
      }`;
    case "loop_post":
      return `${actorName} posted to The Loop`;
  }
}

export function NotificationItem({
  activity,
  members,
  currentMemberId,
  onRead,
}: NotificationItemProps) {
  const navigate = useNavigate();
  const actor = members.find((m) => m.id === activity.actorId);
  const unread = !activity.readBy.includes(currentMemberId);
  const text = activityText(activity, members, currentMemberId);

  function handleClick() {
    navigate(activity.targetRoute);
    onRead();
  }

  return (
    <button type="button" className={styles.item} data-unread={unread || undefined} onClick={handleClick}>
      <Avatar src={actor?.photoUrl} name={actor?.name ?? "Someone"} size="sm" />
      <span className={styles.body}>
        <span className={styles.text}>{text}</span>
        <span className={styles.time}>{relativeTime(activity.createdAt)}</span>
      </span>
      {unread && <span className={styles.dot} aria-label="Unread" />}
    </button>
  );
}
