import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./Popover.module.css";

export type PopoverAlign = "start" | "end";

export interface PopoverProps {
  /** The element that toggles the panel. Clicking it opens/closes the popover. */
  trigger: ReactNode;
  /** The panel contents shown when open. */
  children: ReactNode;
  /** Horizontal alignment of the panel relative to the trigger. Defaults to "end". */
  align?: PopoverAlign;
  /** Accessible label for the panel (role="dialog"). */
  ariaLabel?: string;
}

/**
 * Generic anchored popover. Renders the trigger and toggles an absolutely
 * positioned panel beneath it. Closes on outside click and Escape. The trigger
 * receives aria-haspopup/aria-expanded so any element (e.g. a Button) is
 * announced correctly.
 */
export function Popover({ trigger, children, align = "end", ariaLabel }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const triggerNode = isValidElement(trigger)
    ? cloneElement(trigger as React.ReactElement<Record<string, unknown>>, {
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: (e: React.MouseEvent) => {
          const original = (trigger.props as { onClick?: (e: React.MouseEvent) => void }).onClick;
          original?.(e);
          setOpen((v) => !v);
        },
      })
    : trigger;

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {triggerNode}
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={ariaLabel}
          data-align={align}
          className={styles.panel}
        >
          {children}
        </div>
      )}
    </div>
  );
}
