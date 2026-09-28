import type { ReactNode } from "react";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { BottomSheet, Button, Eyebrow, RadioList, SegmentedControl } from "@analog/ui";
import type { SortOrder } from "../../lib/feed";
import styles from "./Sheets.module.css";

export type { SortOrder };

export interface SortOption<B extends string> {
  value: B;
  label: string;
  icon: ReactNode;
}

export interface SortValue<B extends string> {
  by: B;
  order: SortOrder;
}

export interface SortSheetProps<B extends string> {
  open: boolean;
  onClose: () => void;
  options: SortOption<B>[];
  value: SortValue<B>;
  onChange: (value: SortValue<B>) => void;
}

const ORDER_OPTIONS = [
  { value: "asc", label: "Ascending", icon: <ArrowUpNarrowWide size={15} strokeWidth={1.75} /> },
  { value: "desc", label: "Descending", icon: <ArrowDownWideNarrow size={15} strokeWidth={1.75} /> },
];

/** Sort applies live; Apply closes the sheet. */
export function SortSheet<B extends string>({ open, onClose, options, value, onChange }: SortSheetProps<B>) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Sort by">
      <RadioList label="Sort by" options={options} value={value.by} onChange={(by) => onChange({ ...value, by })} />
      <section className={styles.section}>
        <Eyebrow as="h3">Order</Eyebrow>
        <SegmentedControl
          ariaLabel="Order"
          options={ORDER_OPTIONS}
          value={value.order}
          onChange={(order) => onChange({ ...value, order: order as SortOrder })}
        />
      </section>
      <Button size="lg" fullWidth onClick={onClose}>
        Apply
      </Button>
    </BottomSheet>
  );
}
