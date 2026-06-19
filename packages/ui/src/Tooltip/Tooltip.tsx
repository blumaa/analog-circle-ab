import { cloneElement, useId, useState, type ReactElement, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  /** Content shown inside the tooltip popup. */
  content: ReactNode;
  /**
   * The trigger element. Must be a single element that can receive
   * `aria-describedby` and hover/focus handlers (e.g. a button or span).
   */
  children: ReactElement;
}

interface TriggerProps {
  "aria-describedby"?: string;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
}

/**
 * A hover/focus tooltip. Shows `content` in a small token-styled popup above
 * the trigger on pointer hover and keyboard focus. The trigger is linked to the
 * tooltip via `aria-describedby` for assistive tech.
 */
export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const child = children as ReactElement<TriggerProps>;
  const childProps = child.props;

  const trigger = cloneElement(child, {
    "aria-describedby": open ? id : childProps["aria-describedby"],
    onMouseEnter: (e: React.MouseEvent) => {
      setOpen(true);
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setOpen(false);
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      setOpen(true);
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      setOpen(false);
      childProps.onBlur?.(e);
    },
  });

  return (
    <span className={styles.wrapper}>
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={styles.tooltip}
        data-open={open || undefined}
        hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
