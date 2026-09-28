import type { ReactNode } from "react";
import { BottomSheet, Button } from "@analog/ui";
import styles from "./Sheets.module.css";

export interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  /** Live count of what the current filters would show. */
  resultCount: number;
  children: ReactNode;
}

/** Filters apply live; the CTA shows the live count and closes. Pages supply their own groups. */
export function FilterSheet({ open, onClose, onReset, resultCount, children }: FilterSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filters"
      action={
        <button type="button" className={styles.reset} onClick={onReset}>
          Reset
        </button>
      }
    >
      {children}
      <Button size="lg" fullWidth onClick={onClose}>
        {`Show ${resultCount} ${resultCount === 1 ? "result" : "results"}`}
      </Button>
    </BottomSheet>
  );
}
