import type { ReactNode } from "react";
import styles from "./Label.module.css";

export interface LabelProps {
  children: ReactNode;
  as?: "span" | "div";
}

export function Label({ children, as = "span" }: LabelProps) {
  const Component = as;
  return <Component className={styles.label}>{children}</Component>;
}
