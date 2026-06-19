import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

export type TextareaResize = "none" | "vertical";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  /** @default "vertical" */
  resize?: TextareaResize;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, id: idProp, className, rows = 4, resize = "vertical", ...rest },
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
        <textarea
          ref={ref}
          id={id}
          className={styles.textarea}
          rows={rows}
          data-resize={resize}
          {...rest}
        />
      </div>
    );
  },
);
