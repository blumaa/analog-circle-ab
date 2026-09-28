import type { ReactNode } from "react";
import styles from "./TypeTag.module.css";

export type TypeTagTone = "gold" | "green" | "pink";

export interface TypeTagProps {
  tone?: TypeTagTone;
  children: ReactNode;
  className?: string;
}

/**
 * Small uppercase outlined label: EVENT, BIRTHDAY, OFFER, INNER CIRCLE…
 * Truncates with an ellipsis when its container is too narrow; text tags
 * keep their full wording in a tooltip.
 */
export function TypeTag({ tone = "gold", children, className }: TypeTagProps) {
  return (
    <span
      data-tone={tone}
      title={typeof children === "string" ? children : undefined}
      className={[styles.tag, className].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
}
