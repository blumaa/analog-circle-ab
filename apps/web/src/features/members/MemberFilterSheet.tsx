import type { Circle } from "../../data/types";
import { EMPTY_MEMBER_FILTER, type MemberFilter } from "../../lib/memberList";
import { ChipGroup } from "../lists/ChipGroup";
import { FilterSheet } from "../lists/FilterSheet";

export interface MemberFilterSheetProps {
  open: boolean;
  onClose: () => void;
  circles: Circle[];
  filter: MemberFilter;
  onChange: (filter: MemberFilter) => void;
  resultCount: number;
}

/** Inner Circle and circle chips, shared by the directory and admin members. */
export function MemberFilterSheet({ open, onClose, circles, filter, onChange, resultCount }: MemberFilterSheetProps) {
  const innerOptions = circles
    .filter((c) => c.type === "inner")
    .toSorted((a, b) => (a.number ?? 0) - (b.number ?? 0))
    .map((c) => ({ value: c.id, label: `IC${c.number}` }));
  const circleOptions = circles
    .filter((c) => c.type !== "inner")
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <FilterSheet open={open} onClose={onClose} onReset={() => onChange(EMPTY_MEMBER_FILTER)} resultCount={resultCount}>
      <ChipGroup
        label="Inner Circle"
        options={innerOptions}
        selected={filter.innerCircleIds}
        onChange={(innerCircleIds) => onChange({ ...filter, innerCircleIds })}
      />
      <ChipGroup
        label="Circles"
        options={circleOptions}
        selected={filter.circleIds}
        onChange={(circleIds) => onChange({ ...filter, circleIds })}
      />
    </FilterSheet>
  );
}
