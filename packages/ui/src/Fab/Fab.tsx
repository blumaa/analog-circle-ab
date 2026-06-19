import { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Fab.module.css";

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to render inside the FAB. */
  icon: ReactNode;
  /** Accessible label (required for icon-only buttons). */
  "aria-label": string;
}

/**
 * Floating Action Button — circular, fixed bottom-right, primary-filled.
 * Sits above the bottom nav with safe spacing.
 */
export function Fab({ icon, className, ...rest }: FabProps) {
  return (
    <button
      type="button"
      data-fab
      className={[styles.fab, className].filter(Boolean).join(" ")}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
