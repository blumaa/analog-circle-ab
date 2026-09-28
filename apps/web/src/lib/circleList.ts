import type { Circle, CircleType } from "../data/types";
import type { SortOrder } from "./feed";

export type CircleTab = CircleType | "all";
export type CircleSortBy = "name" | "members" | "newest";

export interface CircleSort {
  by: CircleSortBy;
  order: SortOrder;
}

export const DEFAULT_CIRCLE_SORT: CircleSort = { by: "name", order: "asc" };

export interface CircleFilter {
  mineOnly: boolean;
}

export const EMPTY_CIRCLE_FILTER: CircleFilter = { mineOnly: false };

export interface CircleQuery {
  tab: CircleTab;
  query: string;
  filter: CircleFilter;
  sort: CircleSort;
  viewerId: string;
}

function sortKey(circle: Circle, by: CircleSortBy): string | number {
  switch (by) {
    case "name":
      return circle.name.toLocaleLowerCase();
    case "members":
      return circle.memberIds.length;
    case "newest":
      return circle.createdAt;
  }
}

export function activeCircleFilterCount(filter: CircleFilter): number {
  return filter.mineOnly ? 1 : 0;
}

/** Circles for a list page, in display order. Ties fall back to name. */
export function selectCircles(circles: Circle[], q: CircleQuery): Circle[] {
  const needle = q.query.trim().toLocaleLowerCase();
  const dir = q.sort.order === "asc" ? 1 : -1;
  return circles
    .filter(
      (c) =>
        (q.tab === "all" || c.type === q.tab) &&
        (!needle || `${c.name} ${c.description}`.toLocaleLowerCase().includes(needle)) &&
        (!q.filter.mineOnly || c.memberIds.includes(q.viewerId)),
    )
    .toSorted((a, b) => {
      const ka = sortKey(a, q.sort.by);
      const kb = sortKey(b, q.sort.by);
      if (ka === kb) return a.name.localeCompare(b.name);
      return (ka < kb ? -1 : 1) * dir;
    });
}
