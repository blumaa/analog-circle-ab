import { useState } from "react";
import { Button, SegmentedControl } from "@analog/ui";
import type { Activity, Member } from "../data/types";
import { useMarkActivityRead, useMarkAllActivityRead } from "../data/hooks";
import { NotificationItem } from "./NotificationItem";
import styles from "./NotificationsPanel.module.css";

export interface NotificationsPanelProps {
  activities: Activity[];
  members: Member[];
  currentMemberId: string;
}

type TabValue = "analog" | "inner" | "yourself";

const TABS = [
  { value: "analog", label: "Analog Circle" },
  { value: "inner", label: "Inner Circle" },
  { value: "yourself", label: "Yourself" },
];

function filterActivities(
  activities: Activity[],
  tab: TabValue,
  currentMemberId: string,
): Activity[] {
  switch (tab) {
    case "analog":
      return activities.filter((a) => a.scope === "analog");
    case "inner":
      return activities.filter((a) => a.scope === "inner");
    case "yourself":
      return activities.filter((a) => a.subjectId === currentMemberId);
  }
}

export function NotificationsPanel({
  activities,
  members,
  currentMemberId,
}: NotificationsPanelProps) {
  const [tab, setTab] = useState<TabValue>("analog");
  const markRead = useMarkActivityRead();
  const markAll = useMarkAllActivityRead();

  const visible = filterActivities(activities, tab, currentMemberId);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Activity</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAll.mutate(currentMemberId)}
        >
          Mark all read
        </Button>
      </div>
      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={(v) => setTab(v as TabValue)}
        ariaLabel="Notification scope"
        className={styles.tabs}
      />
      {visible.length === 0 ? (
        <p className={styles.empty}>Nothing here yet.</p>
      ) : (
        <ul className={styles.list}>
          {visible.map((activity) => (
            <li key={activity.id}>
              <NotificationItem
                activity={activity}
                members={members}
                currentMemberId={currentMemberId}
                onRead={() => markRead.mutate({ id: activity.id, memberId: currentMemberId })}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
