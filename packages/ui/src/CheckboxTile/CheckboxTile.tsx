import { Check } from "lucide-react";
import styles from "./CheckboxTile.module.css";

export interface CheckboxTileProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** 40px multi-select tile with an 18px gold box. */
export function CheckboxTile({ label, checked, onChange, disabled, className }: CheckboxTileProps) {
  return (
    <label
      className={[styles.tile, className].filter(Boolean).join(" ")}
      data-checked={checked || undefined}
      data-disabled={disabled || undefined}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={styles.input}
      />
      <span className={styles.box} aria-hidden="true">
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className={styles.label}>{label}</span>
    </label>
  );
}
