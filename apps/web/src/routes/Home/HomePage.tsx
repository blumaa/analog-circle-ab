import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Fab } from "@analog/ui";
import { usePosts } from "../../data/hooks";
import { FeedTabs } from "../../features/feed/FeedTabs";
import { PostFilterSheet } from "../../features/feed/PostFilterSheet";
import { PostList } from "../../features/feed/PostList";
import { POST_SORT_OPTIONS } from "../../features/feed/postSort";
import { useCommentBodies } from "../../features/feed/useCommentBodies";
import { useFeedContext } from "../../features/feed/useFeedContext";
import { ListControls } from "../../features/lists/ListControls";
import { ListToolbar } from "../../features/lists/ListToolbar";
import { SortSheet } from "../../features/lists/SortSheet";
import {
  activeFilterCount,
  DEFAULT_SORT,
  EMPTY_FILTER,
  selectFeed,
  type FeedTab,
  type PostFilter,
  type PostSort,
} from "../../lib/feed";
import styles from "./HomePage.module.css";

type OpenSheet = "sort" | "filter" | null;

export function HomePage() {
  const navigate = useNavigate();
  const { data: posts } = usePosts();
  const { ctx, authorName } = useFeedContext();
  const [tabs, setTabs] = useState<Set<FeedTab>>(() => new Set());
  const [filter, setFilter] = useState<PostFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<PostSort>(DEFAULT_SORT);
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const commentBodies = useCommentBodies(query.trim() !== "");
  const shown =
    posts && ctx
      ? selectFeed(posts, ctx, { tabs, filter, sort, query, authorName, commentBodies, now: new Date() })
      : null;
  const close = () => setSheet(null);

  return (
    <div className={styles.page}>
      <h1 className={styles.srOnly}>Home</h1>
      <ListControls label="Feed controls">
        <FeedTabs value={tabs} onChange={setTabs} />
        <ListToolbar
          query={query}
          onQuery={setQuery}
          searchLabel="Search"
          onSort={() => setSheet("sort")}
          onFilter={() => setSheet("filter")}
          filterCount={activeFilterCount(filter)}
        />
      </ListControls>
      {shown && <PostList posts={shown} />}
      <SortSheet open={sheet === "sort"} onClose={close} options={POST_SORT_OPTIONS} value={sort} onChange={setSort} />
      <PostFilterSheet
        open={sheet === "filter"}
        onClose={close}
        value={filter}
        onChange={setFilter}
        resultCount={shown?.length ?? 0}
      />
      <Fab icon={<Plus size={24} strokeWidth={2} />} aria-label="New post" onClick={() => navigate("/new")} />
    </div>
  );
}
