import type { ReactNode } from "react";
import { BottomSheet, Button } from "@analog/ui";
import styles from "./ConfirmSheet.module.css";

export interface ConfirmSheetProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  /** Colour of the action button. Defaults to "danger" for destructive actions. */
  tone?: "danger" | "primary";
}

/** Confirmation sheet with an action and a Cancel button. */
export function ConfirmSheet({ open, title, children, confirmLabel, onConfirm, onClose, tone = "danger" }: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {children && <p className={styles.message}>{children}</p>}
      <div className={styles.actions}>
        <Button variant={tone} size="lg" fullWidth onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
          Cancel
        </Button>
      </div>
    </BottomSheet>
  );
}
