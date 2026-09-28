import { useId, type ReactNode } from "react";
import styles from "./RadioList.module.css";

export interface RadioOption<V extends string = string> {
  value: V;
  label: string;
  icon?: ReactNode;
}

export interface RadioListProps<V extends string = string> {
  options: RadioOption<V>[];
  value: V;
  onChange: (value: V) => void;
  /** Accessible group name. */
  label: string;
  /** list = sort sheet rows; chips = 36px inline radio chips (New form type). */
  variant?: "list" | "chips";
  className?: string;
}

/** Native radios with custom 20px ring + 9px dot. */
export function RadioList<V extends string = string>({
  options,
  value,
  onChange,
  label,
  variant = "list",
  className,
}: RadioListProps<V>) {
  const name = useId();
  return (
    <div role="radiogroup" aria-label={label} data-variant={variant} className={[styles.group, className].filter(Boolean).join(" ")}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <label key={o.value} className={styles.option} data-checked={checked || undefined}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={checked}
              onChange={() => onChange(o.value)}
              className={styles.input}
            />
            {o.icon && (
              <span className={styles.icon} aria-hidden="true">
                {o.icon}
              </span>
            )}
            <span className={styles.label}>{o.label}</span>
            <span className={styles.radio} aria-hidden="true" />
          </label>
        );
      })}
    </div>
  );
}
