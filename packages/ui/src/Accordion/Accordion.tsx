import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Accordion.module.css";

export interface AccordionProps {
  /** Always-visible header row content. */
  summary: ReactNode;
  /** Revealed content. */
  children: ReactNode;
  defaultOpen?: boolean;
  /** Optional right-aligned node in the header (e.g. a status). */
  trailing?: ReactNode;
  /** When true and open, renders a full-width hairline below the trigger. */
  divided?: boolean;
}

export function Accordion({
  summary,
  children,
  defaultOpen = false,
  trailing,
  divided = false,
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div
      className={styles.accordion}
      data-open={open || undefined}
      data-divided={divided || undefined}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.summaryWrap}>
          <span className={styles.summary}>{summary}</span>
          {trailing != null && <span className={styles.trailing}>{trailing}</span>}
        </span>
        <span className={styles.chevron} aria-hidden="true">
          <ChevronDown size={18} />
        </span>
      </button>
      <div id={contentId} hidden={!open} className={styles.content}>
        {children}
      </div>
    </div>
  );
}
