import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "../Button/Button";
import { Card, CardHeader, CardBody, CardFooter } from "../Card/Card";
import styles from "./Modal.module.css";

export interface ModalProps {
  /** Whether the dialog is visible. Renders nothing when false. */
  open: boolean;
  /** Called when the user dismisses via Esc, overlay click, or the close button. */
  onClose: () => void;
  /** Accessible title; labels the dialog and renders in the header. */
  title: string;
  children: ReactNode;
  /** Optional footer content (e.g. action buttons). */
  footer?: ReactNode;
}

/**
 * Accessible modal dialog. Renders an overlay + centered panel composed from
 * Card slots. Closes on Esc, overlay click, and a close button. Moves focus
 * into the dialog on open and restores it to the previously focused element on
 * close.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    // Move focus into the dialog.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      data-testid="modal-overlay"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <Card variant="default" className={styles.card}>
          <CardHeader className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Close dialog"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </CardHeader>
          <CardBody>{children}</CardBody>
          {footer && <CardFooter className={styles.footer}>{footer}</CardFooter>}
        </Card>
      </div>
    </div>,
    document.body,
  );
}
