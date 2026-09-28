import { useState } from "react";
import { Plus } from "lucide-react";
import { Button, SearchField, useToast } from "@analog/ui";
import { useCircles, useDeleteCircle, useMembers, usePosts } from "../../data/hooks";
import type { Circle } from "../../data/types";
import { AddMemberSheet } from "../../features/admin/AddMemberSheet";
import { AdminCircleRow } from "../../features/admin/AdminCircleRow";
import { AdminHeader } from "../../features/admin/AdminHeader";
import { CircleFormSheet } from "../../features/circles/CircleFormSheet";
import { CircleTypeTabs } from "../../features/circles/CircleTypeTabs";
import { ConfirmSheet } from "../../components/ConfirmSheet";
import { EmptyState } from "../../components/EmptyState";
import { circleMeta } from "../../lib/adminLabels";
import { memberCount } from "../../lib/circles";
import { DEFAULT_CIRCLE_SORT, EMPTY_CIRCLE_FILTER, selectCircles, type CircleTab } from "../../lib/circleList";
import { toIsoDate } from "../../lib/dates";
import styles from "./AdminPage.module.css";

/** Which sheet is open, and for which circle. */
type OpenSheet =
  | { kind: "form"; circle?: Circle }
  | { kind: "delete"; circle: Circle }
  | { kind: "add"; circle: Circle }
  | null;

export function AdminCirclesPage() {
  const { data: circles } = useCircles();
  const { data: members = [] } = useMembers();
  const { data: posts = [] } = usePosts();
  const deleteCircle = useDeleteCircle();
  const toast = useToast();
  const [tab, setTab] = useState<CircleTab>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const today = toIsoDate(new Date());
  const shown = circles
    ? selectCircles(circles, { tab, query, filter: EMPTY_CIRCLE_FILTER, sort: DEFAULT_CIRCLE_SORT, viewerId: "" })
    : null;
  const close = () => setSheet(null);

  const confirmDelete = (circle: Circle) =>
    deleteCircle.mutate(circle.id, {
      onSuccess: () => {
        toast.success(`Deleted ${circle.name}`);
        close();
      },
    });

  return (
    <div className={styles.page}>
      <AdminHeader
        title="Circles"
        summary={circles ? `${circles.length} circles · ${memberCount(members.length)}` : undefined}
        action={
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => setSheet({ kind: "form" })}>
            New circle
          </Button>
        }
      />
      <CircleTypeTabs value={tab} onChange={setTab} short />
      <SearchField value={query} onChange={setQuery} placeholder="Search circles" />
      {shown &&
        (shown.length > 0 ? (
          <div className={styles.list}>
            {shown.map((c) => (
              <AdminCircleRow
                key={c.id}
                circle={c}
                meta={circleMeta(c, posts, today)}
                members={members}
                expanded={openId === c.id}
                onToggle={() => setOpenId(openId === c.id ? null : c.id)}
                onEdit={() => setSheet({ kind: "form", circle: c })}
                onDelete={() => setSheet({ kind: "delete", circle: c })}
                onAddMember={() => setSheet({ kind: "add", circle: c })}
              />
            ))}
          </div>
        ) : (
          <EmptyState>No circles match.</EmptyState>
        ))}
      <CircleFormSheet open={sheet?.kind === "form"} onClose={close} circle={sheet?.kind === "form" ? sheet.circle : undefined} allowInner />
      <ConfirmSheet
        open={sheet?.kind === "delete"}
        title={sheet?.kind === "delete" ? `Delete ${sheet.circle.name}?` : ""}
        confirmLabel="Delete circle"
        onConfirm={() => sheet?.kind === "delete" && confirmDelete(sheet.circle)}
        onClose={close}
      >
        Members stay in TAC. This can't be undone.
      </ConfirmSheet>
      <AddMemberSheet
        circle={sheet?.kind === "add" ? (circles?.find((c) => c.id === sheet.circle.id) ?? null) : null}
        circles={circles ?? []}
        members={members}
        onClose={close}
      />
    </div>
  );
}
