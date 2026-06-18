import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  label?: string;
}

export function Input({ leftIcon, label, id: idProp, className, ...rest }: InputProps) {
  const generatedId = useId();
  const id = idProp ?? (label ? generatedId : undefined);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={id} className={styles.labelText}>
          {label}
        </label>
      )}
      <div className={styles.inputRow}>
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          className={styles.input}
          data-has-left-icon={leftIcon ? true : undefined}
          {...rest}
        />
      </div>
    </div>
  );
}
