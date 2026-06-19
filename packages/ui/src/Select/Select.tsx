import {
  forwardRef,
  useId,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { options, value, onChange, label, placeholder, id: idProp, className, ...rest },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? (label ? generatedId : undefined);

    return (
      <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
        {label && (
          <label htmlFor={id} className={styles.labelText}>
            {label}
          </label>
        )}
        <div className={styles.selectRow}>
          <select
            ref={ref}
            id={id}
            className={styles.select}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            data-placeholder={placeholder && value === "" ? true : undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className={styles.chevron} aria-hidden="true" />
        </div>
      </div>
    );
  },
);
