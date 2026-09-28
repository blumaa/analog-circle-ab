import type { ReactNode } from "react";
import styles from "./ListControls.module.css";

export interface ListControlsProps {
  /** Names the group for screen readers, e.g. "Feed controls". */
  label: string;
  children: ReactNode;
}

/** Tabs, search, sort and filter for a list. Sticks under the app header so only the list scrolls. */
export function ListControls({ label, children }: ListControlsProps) {
  return (
    <div role="group" aria-label={label} className={styles.controls}>
      {children}
    </div>
  );
}
