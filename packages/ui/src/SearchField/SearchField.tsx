import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import styles from "./SearchField.module.css";

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  /** Accessible name. Defaults to the placeholder. */
  label?: string;
}

/** 38px toolbar search: deep bg, search icon on the right. */
export function SearchField({ value, onChange, label, placeholder = "Search", className, ...rest }: SearchFieldProps) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <input
        type="search"
        aria-label={label ?? placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        {...rest}
      />
      <Search size={16} aria-hidden="true" className={styles.icon} />
    </div>
  );
}
