import styles from "./Spinner.module.css";

export interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = "Loading", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={[styles.spinner, className].filter(Boolean).join(" ")}
    >
      <span className={styles.ring} aria-hidden="true" />
    </span>
  );
}
