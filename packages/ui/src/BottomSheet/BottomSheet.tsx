import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./BottomSheet.module.css";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Visible Playfair title; also labels the dialog. */
  title?: string;
  /** Accessible name when there is no visible title. */
  ariaLabel?: string;
  /** Right side of the title row, e.g. a Reset link. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Modal sheet sliding up from the bottom. Closes on Esc and overlay tap. */
export function BottomSheet({ open, onClose, title, ariaLabel, action, children, className }: BottomSheetProps) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} data-testid="sheet-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className={[styles.sheet, className].filter(Boolean).join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <span className={styles.handle} aria-hidden="true" />
        {title && (
          <div className={styles.titleRow}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {action}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
