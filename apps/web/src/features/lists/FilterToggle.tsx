import type { ReactNode } from "react";
import { Toggle } from "@analog/ui";
import styles from "./Sheets.module.css";

export interface FilterToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Label + toggle row inside a filter sheet. */
export function FilterToggle({ label, checked, onChange }: FilterToggleProps) {
  return (
    <div className={styles.toggleRow}>
      <span aria-hidden="true">{label}</span>
      <Toggle label={label} checked={checked} onChange={onChange} onSheet />
    </div>
  );
}

/** Bordered card that stacks a sheet's filter toggles with dividers. */
export function FilterToggleGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={styles.toggles}>
      {children}
    </div>
  );
}
