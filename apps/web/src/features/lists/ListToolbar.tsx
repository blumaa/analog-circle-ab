import type { ReactNode } from "react";
import { ArrowUpDown, LayoutList, ListFilter } from "lucide-react";
import { Button, SearchField } from "@analog/ui";
import styles from "./ListToolbar.module.css";

export type ListView = "cards" | "compact";

export interface ListToolbarProps {
  /** Pass both to show the search field. */
  query?: string;
  onQuery?: (query: string) => void;
  searchLabel?: string;
  /** Pass both to show the View toggle. */
  view?: ListView;
  onView?: (view: ListView) => void;
  onSort?: () => void;
  onFilter?: () => void;
  filterCount?: number;
  /** Extra button before Sort, e.g. "New circle". */
  action?: ReactNode;
}

/** Search + View + Sort + Filter row used on every list page. */
export function ListToolbar({
  query,
  onQuery,
  searchLabel,
  view,
  onView,
  onSort,
  onFilter,
  filterCount = 0,
  action,
}: ListToolbarProps) {
  return (
    <div className={styles.toolbar}>
      {query !== undefined && onQuery && (
        <SearchField value={query} onChange={onQuery} label={searchLabel} className={styles.search} />
      )}
      {action}
      {view && onView && (
        <Button
          variant="secondary"
          size="md"
          leftIcon={<LayoutList size={15} strokeWidth={1.75} />}
          aria-label={`View: ${view}`}
          onClick={() => onView(view === "cards" ? "compact" : "cards")}
        >
          View
        </Button>
      )}
      {onSort && (
        <Button variant="secondary" size="md" leftIcon={<ArrowUpDown size={15} strokeWidth={1.75} />} onClick={onSort}>
          Sort
        </Button>
      )}
      {onFilter && (
        <button
          type="button"
          className={styles.filter}
          aria-label={filterCount ? `Filter, ${filterCount} active` : "Filter"}
          data-active={filterCount > 0 || undefined}
          onClick={onFilter}
        >
          <ListFilter size={17} strokeWidth={1.75} aria-hidden="true" />
          {filterCount > 0 && (
            <span className={styles.count} aria-hidden="true">
              {filterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
