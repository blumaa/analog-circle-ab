import { useState, useMemo, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import {
  Button,
  Chip,
  Header,
  Input,
  SegmentedControl,
  Textarea,
  useToast,
} from "@analog/ui";
import {
  useLoopPosts,
  useCreateLoopPost,
  useArchiveLoopPost,
  useAddLoopNote,
  useCurrentMemberId,
  useMembers,
} from "../../data/hooks";
import { PostCard } from "../../components/PostCard";
import { filterLoopPosts, type KindFilter } from "./filterLoop";
import styles from "./TheLoop.module.css";

const LOOP_CATEGORIES = [
  "Jobs & Career",
  "Health",
  "Tech & Digital",
  "Legal & Admin",
  "Food & Cooking",
  "Housing & Home",
  "Language Help",
  "Sports & Fitness",
  "Art & Craft",
  "Grooming",
  "Social & Events",
  "Something Random",
] as const;

type ScopeFilter = "analog" | "inner";
type PostKind = "need" | "offer";

export function TheLoopPage() {
  const { data: posts = [] } = useLoopPosts();
  const { data: members = [] } = useMembers();
  const { data: currentMemberId } = useCurrentMemberId();
  const createPost = useCreateLoopPost();
  const archivePost = useArchiveLoopPost();
  const addNote = useAddLoopNote();
  const toast = useToast();

  // Composer state
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftKind, setDraftKind] = useState<PostKind>("need");
  const [draftScope, setDraftScope] = useState<ScopeFilter>("analog");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftBody, setDraftBody] = useState("");

  // Filter state
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all categories");

  const memberMap = useMemo(() => {
    const m = new Map<string, { name: string; whatsappUrl: string | null }>();
    for (const member of members) {
      m.set(member.id, { name: member.name, whatsappUrl: member.whatsappUrl ?? null });
    }
    return m;
  }, [members]);

  const resolveAuthorName = useCallback(
    (authorId: string) => memberMap.get(authorId)?.name ?? "Unknown",
    [memberMap],
  );
  const resolveWhatsappUrl = (authorId: string) => memberMap.get(authorId)?.whatsappUrl ?? null;

  const filteredPosts = useMemo(
    () => filterLoopPosts(posts, { query, kind: kindFilter, category: categoryFilter, currentMemberId }, resolveAuthorName),
    [posts, query, kindFilter, categoryFilter, currentMemberId, resolveAuthorName],
  );

  const counts = useMemo(() => {
    const nonArchived = posts.filter((p) => !p.archived);
    return {
      all: nonArchived.length,
      need: nonArchived.filter((p) => p.kind === "need").length,
      offer: nonArchived.filter((p) => p.kind === "offer").length,
      archived: posts.filter((p) => p.archived).length,
      mine: currentMemberId ? nonArchived.filter((p) => p.authorId === currentMemberId).length : 0,
    };
  }, [posts, currentMemberId]);

  function handleSave() {
    if (!currentMemberId || !draftCategory.trim() || !draftBody.trim()) return;
    createPost.mutate(
      {
        scope: draftScope,
        kind: draftKind,
        category: draftCategory.trim(),
        body: draftBody.trim(),
        authorId: currentMemberId,
        archived: false,
        notes: [],
        helpedBy: [],
      },
      {
        onSuccess: () => toast.success("Posted to The Loop."),
        onError: () => toast.error("Couldn't post."),
      },
    );
    setComposerOpen(false);
    setDraftKind("need");
    setDraftScope("analog");
    setDraftCategory("");
    setDraftBody("");
  }

  function handleCancel() {
    setComposerOpen(false);
    setDraftKind("need");
    setDraftScope("analog");
    setDraftCategory("");
    setDraftBody("");
  }

  return (
    <div className={styles.page}>
      <Header
        eyebrow="Community"
        title="The Loop"
        description="Ask for help and offer what you can. Browse what's already here, then add your own need or offer."
      />

      <div className={styles.addRow}>
        <Button
          variant="outline"
          leftIcon={<Plus size={16} />}
          onClick={() => setComposerOpen((v) => !v)}
        >
          Add to The Loop
        </Button>
      </div>

      {composerOpen && (
        <div className={styles.composer}>
          <div className={styles.composerField}>
            <span className={styles.composerLabel}>Type</span>
            <SegmentedControl
              options={[
                { value: "need", label: "Need" },
                { value: "offer", label: "Offer" },
              ]}
              value={draftKind}
              onChange={(v) => setDraftKind(v as PostKind)}
              ariaLabel="Post type"
            />
          </div>

          <div className={styles.composerField}>
            <span className={styles.composerLabel}>Visibility</span>
            <SegmentedControl
              options={[
                { value: "inner", label: "Inner Circle" },
                { value: "analog", label: "Analog Circle" },
              ]}
              value={draftScope}
              onChange={(v) => setDraftScope(v as ScopeFilter)}
              ariaLabel="Post visibility"
            />
          </div>

          <div className={styles.composerField}>
            <span className={styles.composerLabel}>Category</span>
            <Input
              placeholder="e.g. Housing, Food, Skills…"
              value={draftCategory}
              onChange={(e) => setDraftCategory(e.target.value)}
            />
          </div>

          <div className={styles.composerField}>
            <span className={styles.composerLabel}>Details</span>
            <Textarea
              placeholder="Describe what you need or what you're offering…"
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={4}
            />
          </div>

          <div className={styles.composerActions}>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!draftCategory.trim() || !draftBody.trim()}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      <Input
        variant="bare"
        leftIcon={<Search size={16} />}
        placeholder="Search The Loop"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.search}
        aria-label="Search The Loop"
      />

      <SegmentedControl
        options={[
          { value: "all", label: "All", count: counts.all },
          { value: "need", label: "Needs", count: counts.need },
          { value: "offer", label: "Offers", count: counts.offer },
          { value: "mine", label: "Mine", count: counts.mine },
        ]}
        value={kindFilter}
        onChange={(v) => setKindFilter(v as KindFilter)}
        ariaLabel="Filter by type"
      />

      <div className={styles.chips} aria-label="Filter by category">
        <Chip
          selected={categoryFilter === "all categories"}
          onClick={() => setCategoryFilter("all categories")}
        >
          All categories
        </Chip>
        {LOOP_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={categoryFilter === cat}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Chip>
        ))}
      </div>

      <div className={styles.list}>
        {filteredPosts.length === 0 ? (
          <p className={styles.empty}>Nothing here yet.</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              authorName={resolveAuthorName(post.authorId)}
              authorWhatsappUrl={resolveWhatsappUrl(post.authorId)}
              canArchive={post.authorId === currentMemberId}
              onArchive={() =>
                archivePost.mutate(post.id, {
                  onSuccess: () => toast.success("Post archived."),
                  onError: () => toast.error("Couldn't archive."),
                })
              }
              resolveName={resolveAuthorName}
              currentMemberId={currentMemberId ?? null}
              onAddNote={(postId, authorId, body) =>
                addNote.mutate(
                  { postId, authorId, body },
                  {
                    onSuccess: () => toast.success("Sent — thanks for helping!"),
                    onError: () => toast.error("Couldn't send your note."),
                  },
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
