import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Validation message shown under the field. */
  error?: string;
}

/** 48px form field: deep bg, 12px radius. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, leftIcon, rightIcon, error, id: idProp, className, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? (label ? generatedId : undefined);
  const errorId = `${generatedId}-error`;
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.row}>
        {leftIcon && (
          <span className={styles.leftIcon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={styles.input}
          data-has-left-icon={leftIcon ? true : undefined}
          data-has-right-icon={rightIcon ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        {rightIcon && (
          <span className={styles.rightIcon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
});
