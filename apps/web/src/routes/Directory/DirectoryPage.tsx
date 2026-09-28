import { useState } from "react";
import { useCircles, useMembers } from "../../data/hooks";
import { ListControls } from "../../features/lists/ListControls";
import { ListToolbar, type ListView } from "../../features/lists/ListToolbar";
import { SortSheet } from "../../features/lists/SortSheet";
import { MemberFilterSheet } from "../../features/members/MemberFilterSheet";
import { MemberRow } from "../../features/members/MemberRow";
import { MEMBER_SORT_OPTIONS } from "../../features/members/memberSort";
import {
  activeMemberFilterCount,
  DEFAULT_MEMBER_SORT,
  EMPTY_MEMBER_FILTER,
  selectMembers,
  type MemberFilter,
  type MemberSort,
} from "../../lib/memberList";
import { memberCount } from "../../lib/circles";
import { EmptyState } from "../../components/EmptyState";
import styles from "./DirectoryPage.module.css";

type OpenSheet = "sort" | "filter" | null;

export function DirectoryPage() {
  const { data: members } = useMembers();
  const { data: circles = [] } = useCircles();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ListView>("cards");
  const [filter, setFilter] = useState<MemberFilter>(EMPTY_MEMBER_FILTER);
  const [sort, setSort] = useState<MemberSort>(DEFAULT_MEMBER_SORT);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = members ? selectMembers(members, circles, { query, filter, sort }) : null;
  const close = () => setSheet(null);

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Directory</h1>
        {shown && (
          <p className={styles.count} aria-live="polite">
            {memberCount(shown.length)}
          </p>
        )}
      </header>
      <ListControls label="Member controls">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          searchLabel="Search members"
          view={view}
          onView={setView}
          onSort={() => setSheet("sort")}
          onFilter={() => setSheet("filter")}
          filterCount={activeMemberFilterCount(filter)}
        />
      </ListControls>
      {shown &&
        (shown.length > 0 ? (
          <ul className={styles.list} aria-label="Members">
            {shown.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                circles={circles}
                view={view}
                expanded={openId === m.id}
                onToggle={() => setOpenId(openId === m.id ? null : m.id)}
              />
            ))}
          </ul>
        ) : (
          <EmptyState>No members match.</EmptyState>
        ))}
      <SortSheet
        open={sheet === "sort"}
        onClose={close}
        options={MEMBER_SORT_OPTIONS}
        value={sort}
        onChange={setSort}
      />
      <MemberFilterSheet
        open={sheet === "filter"}
        onClose={close}
        circles={circles}
        filter={filter}
        onChange={setFilter}
        resultCount={shown?.length ?? 0}
      />
    </div>
  );
}
