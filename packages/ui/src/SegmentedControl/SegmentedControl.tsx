import type { ReactNode } from "react";
import styles from "./SegmentedControl.module.css";

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  /** tint = gold-tint selected; solid = solid gold selected (New form "When"). */
  variant?: "tint" | "solid";
  /** Container fill: segmented panel colour, or page bg. */
  surface?: "segmented" | "bg";
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel,
  variant = "tint",
  surface = "segmented",
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-variant={variant}
      data-surface={surface}
      className={[styles.group, className].filter(Boolean).join(" ")}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            data-selected={isSelected || undefined}
            className={styles.option}
            onClick={() => onChange(option.value)}
          >
            {option.icon && (
              <span className={styles.icon} aria-hidden="true">
                {option.icon}
              </span>
            )}
            {option.label}
            {option.count !== undefined && <span className={styles.count}>{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
