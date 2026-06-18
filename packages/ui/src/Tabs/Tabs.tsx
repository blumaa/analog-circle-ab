import type { KeyboardEvent } from "react";
import styles from "./Tabs.module.css";

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({ tabs, value, onChange, ariaLabel, className }: TabsProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = tabs[(index + 1) % tabs.length];
      if (next) onChange(next.value);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = tabs[(index - 1 + tabs.length) % tabs.length];
      if (prev) onChange(prev.value);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={[styles.tablist, className].filter(Boolean).join(" ")}
    >
      {tabs.map((tab, index) => {
        const isSelected = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            data-selected={isSelected || undefined}
            className={styles.tab}
            onClick={() => onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
