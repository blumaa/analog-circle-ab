import { useNavigate } from "react-router-dom";
import { Avatar, BottomSheet, Button } from "@analog/ui";
import { useActivity, useMarkActivityRead, useMarkAllActivityRead, useMe, useMembers } from "../data/hooks";
import type { Activity } from "../data/types";
import { activityFor, activityText, unreadCount } from "../lib/activityText";
import { relativeTime } from "../lib/relativeTime";
import styles from "./NotificationsSheet.module.css";

export interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsSheet({ open, onClose }: NotificationsSheetProps) {
  const navigate = useNavigate();
  const { me } = useMe();
  const { data: activity = [] } = useActivity();
  const { data: members = [] } = useMembers();
  const markRead = useMarkActivityRead();
  const markAll = useMarkAllActivityRead();
  if (!me) return null;

  const items = activityFor(activity, me.id);
  const unread = unreadCount(activity, me.id);
  const openItem = (a: Activity) => {
    if (!a.readBy.includes(me.id)) markRead.mutate({ id: a.id, memberId: me.id });
    onClose();
    navigate(a.targetRoute);
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Notifications"
      action={
        unread > 0 ? (
          <Button variant="tint" size="sm" onClick={() => markAll.mutate(me.id)}>
            Mark all read
          </Button>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <p className={styles.empty}>Nothing new yet.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((a) => {
            const actor = members.find((m) => m.id === a.actorId);
            const isUnread = !a.readBy.includes(me.id);
            return (
              <li key={a.id}>
                <button type="button" className={styles.item} data-unread={isUnread || undefined} onClick={() => openItem(a)}>
                  <Avatar name={actor?.name ?? "?"} src={actor?.photoUrl ?? null} size={36} decorative />
                  <span className={styles.text}>
                    <span>{activityText(a, members, me.id)}</span>
                    <span className={styles.time}>{relativeTime(a.createdAt)}</span>
                  </span>
                  {isUnread && <span className={styles.dot} aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
