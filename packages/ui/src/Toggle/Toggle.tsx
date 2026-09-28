import { ShieldCheck } from "lucide-react";
import styles from "./Toggle.module.css";

export interface ToggleProps {
  /** Accessible name. */
  label: string;
  checked?: boolean;
  onChange?: (next: boolean) => void;
  /** Always on; shows a shield instead of a knob. */
  locked?: boolean;
  /** Off-track uses the deeper tone when the toggle sits on a sheet. */
  onSheet?: boolean;
  className?: string;
}

export function Toggle({ label, checked = false, onChange, locked = false, onSheet = false, className }: ToggleProps) {
  const on = locked || checked;
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={on}
      aria-disabled={locked || undefined}
      data-on={on || undefined}
      data-locked={locked || undefined}
      data-on-sheet={onSheet || undefined}
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      onClick={() => {
        if (!locked) onChange?.(!checked);
      }}
    >
      {locked ? (
        <ShieldCheck size={13} strokeWidth={1.75} className={styles.shield} aria-hidden="true" />
      ) : (
        <span className={styles.knob} aria-hidden="true" />
      )}
    </button>
  );
}
