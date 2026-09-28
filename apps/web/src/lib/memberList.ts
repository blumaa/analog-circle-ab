import type { Circle, Member } from "../data/types";
import { innerCircleOf } from "./circles";
import type { SortOrder } from "./feed";

export type MemberSortBy = "name" | "newest" | "innerCircle";

export interface MemberSort {
  by: MemberSortBy;
  order: SortOrder;
}

export const DEFAULT_MEMBER_SORT: MemberSort = { by: "name", order: "asc" };

export interface MemberFilter {
  /** Match any of these inner circles. */
  innerCircleIds: string[];
  /** Match any of these interest/location circles. */
  circleIds: string[];
}

export const EMPTY_MEMBER_FILTER: MemberFilter = { innerCircleIds: [], circleIds: [] };

export interface MemberQuery {
  query: string;
  filter: MemberFilter;
  sort: MemberSort;
  /** Admin search also matches email. */
  searchEmail?: boolean;
}

export function activeMemberFilterCount(filter: MemberFilter): number {
  return filter.innerCircleIds.length + filter.circleIds.length;
}

const inAny = (circles: Circle[], ids: string[], memberId: string) =>
  ids.length === 0 || circles.some((c) => ids.includes(c.id) && c.memberIds.includes(memberId));

/** Members for the directory, in display order. Ties fall back to name. */
export function selectMembers(members: Member[], circles: Circle[], q: MemberQuery): Member[] {
  const needle = q.query.trim().toLocaleLowerCase();
  const dir = q.sort.order === "asc" ? 1 : -1;
  const icNumber = (id: string) => innerCircleOf(circles, id)?.number ?? null;
  return members
    .filter(
      (m) =>
        (!needle || `${m.name} ${m.bio ?? ""} ${q.searchEmail ? m.email : ""}`.toLocaleLowerCase().includes(needle)) &&
        inAny(circles, q.filter.innerCircleIds, m.id) &&
        inAny(circles, q.filter.circleIds, m.id),
    )
    .toSorted((a, b) => {
      if (q.sort.by === "innerCircle") {
        const na = icNumber(a.id);
        const nb = icNumber(b.id);
        // Members without an inner circle go last in either order.
        if (na !== nb) {
          if (na === null) return 1;
          if (nb === null) return -1;
          return (na - nb) * dir;
        }
        return a.name.localeCompare(b.name);
      }
      const ka = q.sort.by === "name" ? a.name.toLocaleLowerCase() : a.joinedAt;
      const kb = q.sort.by === "name" ? b.name.toLocaleLowerCase() : b.joinedAt;
      if (ka === kb) return a.name.localeCompare(b.name);
      return (ka < kb ? -1 : 1) * dir;
    });
}
