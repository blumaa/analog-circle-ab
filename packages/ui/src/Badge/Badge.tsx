import type { ReactNode } from "react";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "danger"
  | "offer"
  | "event"
  | "accent"
  | "neutral"
  | "success"
  | "rose";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = "neutral", children }: BadgeProps) {
  return (
    <span data-variant={variant} className={styles.badge}>
      {children}
    </span>
  );
}
