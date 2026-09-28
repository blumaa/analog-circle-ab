import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./ReactionPill.module.css";

export interface ReactionPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 22 comment, 28 card footer, 30 detail page. */
  size?: 22 | 28 | 30;
  /** You have added this reaction. */
  active?: boolean;
  children: ReactNode;
}

/** Emoji + count pill. Toggles your reaction. */
export function ReactionPill({ size = 28, active, className, children, ...rest }: ReactionPillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      data-size={size}
      data-active={active || undefined}
      className={[styles.pill, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
