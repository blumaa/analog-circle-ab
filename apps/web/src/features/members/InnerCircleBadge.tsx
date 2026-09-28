import styles from "./InnerCircleBadge.module.css";

/** "IC2" badge: the member's Inner Circle number. `null` shows "None" (admin lists). */
export function InnerCircleBadge({ label }: { label: string | null }) {
  return (
    <span className={styles.badge} data-none={label === null || undefined}>
      {label ?? "None"}
    </span>
  );
}
