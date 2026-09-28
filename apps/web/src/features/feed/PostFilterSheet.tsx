import { Eyebrow, Input, SegmentedControl } from "@analog/ui";
import type { PostType } from "../../data/types";
import { EMPTY_FILTER, type DateRange, type FeedKey, type PostFilter } from "../../lib/feed";
import { POST_TYPE_LABEL } from "../../lib/postLabel";
import { ChipGroup } from "../lists/ChipGroup";
import { FilterSheet } from "../lists/FilterSheet";
import { FilterToggle, FilterToggleGroup } from "../lists/FilterToggle";
import { FEED_LABEL } from "./FeedTabs";
import styles from "./PostFilterSheet.module.css";

const TYPES: PostType[] = ["event", "post", "birthday", "offer", "need"];
const TYPE_OPTIONS = TYPES.map((value) => ({ value, label: POST_TYPE_LABEL[value] }));
const FEED_OPTIONS = (Object.keys(FEED_LABEL) as FeedKey[]).map((value) => ({ value, label: FEED_LABEL[value] }));
const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "any", label: "Any time" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

export interface PostFilterSheetProps {
  open: boolean;
  onClose: () => void;
  value: PostFilter;
  onChange: (filter: PostFilter) => void;
  resultCount: number;
  /** Circle pages hide PUBLISHED IN. */
  showPublishedIn?: boolean;
}

export function PostFilterSheet({ open, onClose, value, onChange, resultCount, showPublishedIn = true }: PostFilterSheetProps) {
  const set = (patch: Partial<PostFilter>) => onChange({ ...value, ...patch });
  return (
    <FilterSheet open={open} onClose={onClose} onReset={() => onChange(EMPTY_FILTER)} resultCount={resultCount}>
      <ChipGroup label="Post type" options={TYPE_OPTIONS} selected={value.types} onChange={(types) => set({ types })} />
      {showPublishedIn && (
        <ChipGroup
          label="Published in"
          options={FEED_OPTIONS}
          selected={value.publishedIn}
          onChange={(publishedIn) => set({ publishedIn })}
        />
      )}
      <section className={styles.section}>
        <Eyebrow as="h3">Date</Eyebrow>
        <SegmentedControl
          ariaLabel="Date"
          options={DATE_OPTIONS}
          value={value.date}
          onChange={(date) => set({ date: date as DateRange })}
        />
        {value.date === "custom" && (
          <div className={styles.range}>
            <Input type="date" label="From" value={value.from ?? ""} onChange={(e) => set({ from: e.target.value || null })} />
            <Input type="date" label="To" value={value.to ?? ""} onChange={(e) => set({ to: e.target.value || null })} />
          </div>
        )}
      </section>
      <FilterToggleGroup label="Options">
        <FilterToggle label="Favourites only" checked={value.favouritesOnly} onChange={(favouritesOnly) => set({ favouritesOnly })} />
        <FilterToggle label="Events I'm going to" checked={value.goingOnly} onChange={(goingOnly) => set({ goingOnly })} />
      </FilterToggleGroup>
    </FilterSheet>
  );
}
