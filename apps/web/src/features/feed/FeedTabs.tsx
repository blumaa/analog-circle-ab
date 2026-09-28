import { Bookmark } from "lucide-react";
import { Chip } from "@analog/ui";
import { toggleTab, type FeedKey, type FeedTab } from "../../lib/feed";
import styles from "./FeedTabs.module.css";

export const FEED_LABEL: Record<FeedKey, string> = {
  community: "Community Circles",
  myCircle: "My Circle",
  square: "The Square",
  loop: "The Loop",
};

const KEYS = Object.keys(FEED_LABEL) as FeedKey[];

export interface FeedTabsProps {
  value: ReadonlySet<FeedTab>;
  onChange: (tabs: Set<FeedTab>) => void;
}

/** Multi-select feed tabs. Empty set = All; All sits outside the scroll row. */
export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <div className={styles.row}>
      <div role="group" aria-label="Feeds" className={styles.scroll}>
        {KEYS.map((key) => (
          <Chip key={key} selected={value.has(key)} onClick={() => onChange(toggleTab(value, key))}>
            {FEED_LABEL[key]}
          </Chip>
        ))}
        <Chip
          aria-label="Favourites"
          selected={value.has("favourites")}
          icon={<Bookmark size={14} strokeWidth={1.75} />}
          className={styles.bookmark}
          onClick={() => onChange(toggleTab(value, "favourites"))}
        />
      </div>
      <Chip selectStyle="single" selected={value.size === 0} className={styles.all} onClick={() => onChange(new Set())}>
        All
      </Chip>
    </div>
  );
}
