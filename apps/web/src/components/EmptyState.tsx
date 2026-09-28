import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

/** Centred muted message for empty lists and missing records. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
