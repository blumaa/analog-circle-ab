import { Bell } from "lucide-react";
import { Button, Popover } from "@analog/ui";
import { useActivity, useCurrentMemberId, useMembers } from "../data/hooks";
import { NotificationsPanel } from "./NotificationsPanel";
import styles from "./NotificationBell.module.css";

/** Top-bar notifications entry point: bell button + unread badge + popover panel. */
export function NotificationBell() {
  const { data: currentMemberId } = useCurrentMemberId();
  const { data: activities = [] } = useActivity();
  const { data: members = [] } = useMembers();

  const memberId = currentMemberId ?? "";
  const unreadCount = activities.filter((a) => !a.readBy.includes(memberId)).length;

  const trigger = (
    <Button
      iconOnly
      aria-label={
        unreadCount > 0 ? `Activity, ${unreadCount} unread` : "Activity"
      }
      variant="outline"
      className={styles.trigger}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {unreadCount}
        </span>
      )}
    </Button>
  );

  return (
    <Popover trigger={trigger} align="end" ariaLabel="Activity">
      <NotificationsPanel
        activities={activities}
        members={members}
        currentMemberId={memberId}
      />
    </Popover>
  );
}
