import type { ReactNode } from "react";
import styles from "./Label.module.css";

export interface LabelProps {
  children: ReactNode;
  as?: "span" | "div";
  /**
   * Controls CSS `text-transform`.
   * - `"uppercase"` — traditional all-caps label style (e.g. profile field labels).
   * - `"none"` — sentence-case (e.g. live dashboard section headings: "Coming up").
   * Defaults to `"uppercase"` to preserve backward compatibility.
   */
  transform?: "uppercase" | "none";
}

export function Label({ children, as = "span", transform = "uppercase" }: LabelProps) {
  const Component = as;
  return (
    <Component
      className={styles.label}
      data-transform={transform}
    >
      {children}
    </Component>
  );
}
