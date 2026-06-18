import type { ReactNode } from "react";
import { Label } from "../Label/Label";
import styles from "./LabeledField.module.css";

export interface LabeledFieldProps {
  label: string;
  children: ReactNode;
}

/** Molecule: uppercase eyebrow label above its children value. */
export function LabeledField({ label, children }: LabeledFieldProps) {
  return (
    <div className={styles.field}>
      <Label as="div">{label}</Label>
      <div className={styles.value}>{children}</div>
    </div>
  );
}
