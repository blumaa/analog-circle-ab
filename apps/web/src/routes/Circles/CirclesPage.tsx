import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@analog/ui";
import { useCircles, useMe, useMembers } from "../../data/hooks";
import { CircleCard } from "../../features/circles/CircleCard";
import { CircleFormSheet } from "../../features/circles/CircleFormSheet";
import { CIRCLE_SORT_OPTIONS } from "../../features/circles/circleSort";
import { CircleTypeTabs } from "../../features/circles/CircleTypeTabs";
import { FilterSheet } from "../../features/lists/FilterSheet";
import { FilterToggle, FilterToggleGroup } from "../../features/lists/FilterToggle";
import { ListControls } from "../../features/lists/ListControls";
import { ListToolbar } from "../../features/lists/ListToolbar";
import { SortSheet } from "../../features/lists/SortSheet";
import {
  activeCircleFilterCount,
  DEFAULT_CIRCLE_SORT,
  EMPTY_CIRCLE_FILTER,
  selectCircles,
  type CircleFilter,
  type CircleSort,
  type CircleTab,
} from "../../lib/circleList";
import { EmptyState } from "../../components/EmptyState";
import styles from "./CirclesPage.module.css";

type OpenSheet = "sort" | "filter" | "new" | null;

export function CirclesPage() {
  const navigate = useNavigate();
  const { me } = useMe();
  const { data: circles } = useCircles();
  const { data: members = [] } = useMembers();
  const [tab, setTab] = useState<CircleTab>("inner");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CircleFilter>(EMPTY_CIRCLE_FILTER);
  const [sort, setSort] = useState<CircleSort>(DEFAULT_CIRCLE_SORT);
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const shown = circles && me ? selectCircles(circles, { tab, query, filter, sort, viewerId: me.id }) : null;
  const close = () => setSheet(null);

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>Circles</h1>
      <ListControls label="Circle controls">
        <CircleTypeTabs value={tab} onChange={setTab} />
        <ListToolbar
          query={query}
          onQuery={setQuery}
          searchLabel="Search circles"
          onSort={() => setSheet("sort")}
          onFilter={() => setSheet("filter")}
          filterCount={activeCircleFilterCount(filter)}
          action={
            <Button size="md" leftIcon={<Plus size={16} strokeWidth={2} />} onClick={() => setSheet("new")}>
              New circle
            </Button>
          }
        />
      </ListControls>
      {shown &&
        (shown.length > 0 ? (
          <div className={styles.list}>
            {shown.map((c) => (
              <CircleCard key={c.id} circle={c} members={members} />
            ))}
          </div>
        ) : (
          <EmptyState>No circles match.</EmptyState>
        ))}
      <SortSheet
        open={sheet === "sort"}
        onClose={close}
        options={CIRCLE_SORT_OPTIONS}
        value={sort}
        onChange={setSort}
      />
      <FilterSheet
        open={sheet === "filter"}
        onClose={close}
        onReset={() => setFilter(EMPTY_CIRCLE_FILTER)}
        resultCount={shown?.length ?? 0}
      >
        <FilterToggleGroup label="Options">
          <FilterToggle
            label="My circles only"
            checked={filter.mineOnly}
            onChange={(mineOnly) => setFilter({ ...filter, mineOnly })}
          />
        </FilterToggleGroup>
      </FilterSheet>
      <CircleFormSheet open={sheet === "new"} onClose={close} onSaved={(c) => navigate(`/circles/${c.id}`)} />
    </div>
  );
}
