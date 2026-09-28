import type { ReactNode } from "react";
import { Eyebrow } from "@analog/ui";
import styles from "./AdminHeader.module.css";

export interface AdminHeaderProps {
  title: string;
  /** "22 circles · 48 members". */
  summary?: string;
  /** Primary button on the right, e.g. "New circle". */
  action?: ReactNode;
}

/** "ADMIN" eyebrow, page title, summary line and primary action. */
export function AdminHeader({ title, summary, action }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <Eyebrow as="p" tone="gold" size={10}>
          Admin
        </Eyebrow>
        <h1 className={styles.title}>{title}</h1>
        {summary && (
          <p className={styles.summary} aria-live="polite">
            {summary}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
