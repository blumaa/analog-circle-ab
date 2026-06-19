import { useNavigate } from "react-router-dom";
import { Avatar } from "@analog/ui";
import type { Activity, Member } from "../data/types";
import { activityText } from "../lib/activityText";
import { relativeTime } from "../lib/relativeTime";
import styles from "./NotificationItem.module.css";

export interface NotificationItemProps {
  activity: Activity;
  members: Member[];
  currentMemberId: string;
  /** Called after navigation to mark this activity read. */
  onRead: () => void;
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
