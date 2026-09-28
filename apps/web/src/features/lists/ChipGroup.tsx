import { Chip, Eyebrow } from "@analog/ui";
import { toggleId } from "../../lib/prefs";
import styles from "./Sheets.module.css";

export interface ChipGroupProps<V extends string> {
  label: string;
  options: { value: V; label: string }[];
  selected: V[];
  onChange: (selected: V[]) => void;
}

/** Labelled multi-select chip row for filter sheets. */
export function ChipGroup<V extends string>({ label, options, selected, onChange }: ChipGroupProps<V>) {
  return (
    <section className={styles.section} aria-label={label}>
      <Eyebrow as="h3">{label}</Eyebrow>
      <div className={styles.chips}>
        {options.map((o) => (
          <Chip
            key={o.value}
            selectStyle="single"
            selected={selected.includes(o.value)}
            onClick={() => onChange(toggleId(selected, o.value) as V[])}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    </section>
  );
}
