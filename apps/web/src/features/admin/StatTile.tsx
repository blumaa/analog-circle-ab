import { ChevronRight } from "lucide-react";
import styles from "./StatTile.module.css";

export interface StatTileProps {
  label: string;
  value: number;
  /** Shown after the value, e.g. 56 gives "(56%)". */
  pct?: number;
  caption?: string;
  /** Makes the tile a drill-down button. */
  onOpen?: () => void;
}

/** One cell of the "This week" grid. */
export function StatTile({ label, value, pct, caption, onOpen }: StatTileProps) {
  const body = (
    <>
      <span className={styles.label}>
        {label}
        {onOpen && <ChevronRight size={14} aria-hidden="true" />}
      </span>
      <span className={styles.value}>
        <span>{value}</span>
        {pct !== undefined && <span className={styles.pct}>({pct}%)</span>}
      </span>
      {caption && <span className={styles.caption}>{caption}</span>}
    </>
  );
  return onOpen ? (
    <button type="button" className={styles.tile} aria-label={`${label}: ${value}`} onClick={onOpen}>
      {body}
    </button>
  ) : (
    <div className={styles.tile} role="group" aria-label={label}>
      {body}
    </div>
  );
}
