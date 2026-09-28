import { useId } from "react";
import { Toggle } from "@analog/ui";
import type { NotificationKey } from "../../data/types";
import type { NotificationGroup } from "./notificationGroups";
import styles from "./NotificationGroupView.module.css";

export interface NotificationGroupViewProps {
  group: NotificationGroup;
  values: Record<NotificationKey, boolean>;
  onChange: (key: NotificationKey, on: boolean) => void;
}

/** One titled block of notification toggles. Rows without a key are locked on. */
export function NotificationGroupView({ group, values, onChange }: NotificationGroupViewProps) {
  const titleId = useId();
  return (
    <div role="group" aria-labelledby={titleId} className={styles.group}>
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>
          {group.title}
        </h3>
        {group.locked ? <Toggle label={group.title} locked /> : null}
      </div>
      {group.note ? <p className={styles.note}>{group.note}</p> : null}
      {group.rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <div className={styles.rowLine}>
            <span className={styles.label} aria-hidden="true">
              {row.label}
            </span>
            {row.key ? (
              <Toggle label={row.label} checked={values[row.key]} onChange={(on) => onChange(row.key!, on)} />
            ) : (
              <Toggle label={row.label} locked />
            )}
          </div>
          {row.note ? <p className={styles.note}>{row.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
