import { X } from "lucide-react";
import { Button } from "../Button/Button";
import styles from "./Toast.module.css";

export type ToastVariant = "success" | "error" | "info";

export interface ToastProps {
  /** Visual + semantic tone of the toast. */
  variant: ToastVariant;
  /** Message body shown to the user. */
  message: string;
  /** Called when the user activates the dismiss button. */
  onDismiss: () => void;
}

/**
 * Presentational toast item. Token-styled surface per variant. Errors announce
 * assertively (role="alert"); success/info announce politely (role="status").
 */
export function Toast({ variant, message, onDismiss }: ToastProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      data-variant={variant}
      className={styles.toast}
    >
      <span className={styles.message}>{message}</span>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Dismiss"
        onClick={onDismiss}
        className={styles.dismiss}
      >
        <X size={16} />
      </Button>
    </div>
  );
}
