import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button, useToast } from "@analog/ui";
import { useCircles, useDeleteMember, useMembers } from "../../data/hooks";
import type { Member } from "../../data/types";
import { AdminHeader } from "../../features/admin/AdminHeader";
import { AdminMemberRow } from "../../features/admin/AdminMemberRow";
import { MemberFormSheet } from "../../features/admin/MemberFormSheet";
import { ListControls } from "../../features/lists/ListControls";
import { ListToolbar } from "../../features/lists/ListToolbar";
import { SortSheet } from "../../features/lists/SortSheet";
import { MemberFilterSheet } from "../../features/members/MemberFilterSheet";
import { MEMBER_SORT_OPTIONS } from "../../features/members/memberSort";
import { ConfirmSheet } from "../../components/ConfirmSheet";
import { EmptyState } from "../../components/EmptyState";
import { memberMeta, notPlacedCount } from "../../lib/adminLabels";
import { innerCircleLabel, memberCount } from "../../lib/circles";
import {
  activeMemberFilterCount,
  DEFAULT_MEMBER_SORT,
  EMPTY_MEMBER_FILTER,
  selectMembers,
  type MemberFilter,
  type MemberSort,
} from "../../lib/memberList";
import styles from "./AdminPage.module.css";

type OpenSheet =
  { kind: "sort" } | { kind: "filter" } | { kind: "form"; member?: Member } | { kind: "delete"; member: Member } | null;

export function AdminMembersPage() {
  const { data: members } = useMembers();
  const { data: circles = [] } = useCircles();
  const deleteMember = useDeleteMember();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MemberFilter>(EMPTY_MEMBER_FILTER);
  const [sort, setSort] = useState<MemberSort>(DEFAULT_MEMBER_SORT);
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const shown = members ? selectMembers(members, circles, { query, filter, sort, searchEmail: true }) : null;
  const close = () => setSheet(null);

  const confirmDelete = (member: Member) =>
    deleteMember.mutate(member.id, {
      onSuccess: () => {
        toast.success(`Deleted ${member.name}`);
        close();
      },
    });

  return (
    <div className={styles.page}>
      <AdminHeader
        title="Members"
        summary={
          members ? `${memberCount(members.length)} · ${notPlacedCount(members, circles)} not placed` : undefined
        }
        action={
          <Button
            variant="primary"
            size="md"
            leftIcon={<UserPlus size={16} />}
            onClick={() => setSheet({ kind: "form" })}
          >
            Add member
          </Button>
        }
      />
      <ListControls label="Member controls">
        <ListToolbar
          query={query}
          onQuery={setQuery}
          searchLabel="Search name or email"
          onSort={() => setSheet({ kind: "sort" })}
          onFilter={() => setSheet({ kind: "filter" })}
          filterCount={activeMemberFilterCount(filter)}
        />
      </ListControls>
      {shown &&
        (shown.length > 0 ? (
          <ul className={styles.card} aria-label="Members">
            {shown.map((m) => (
              <AdminMemberRow
                key={m.id}
                member={m}
                innerCircle={innerCircleLabel(circles, m.id)}
                meta={memberMeta(m)}
                onEdit={() => setSheet({ kind: "form", member: m })}
                onDelete={() => setSheet({ kind: "delete", member: m })}
              />
            ))}
          </ul>
        ) : (
          <EmptyState>No members match.</EmptyState>
        ))}
      <SortSheet
        open={sheet?.kind === "sort"}
        onClose={close}
        options={MEMBER_SORT_OPTIONS}
        value={sort}
        onChange={setSort}
      />
      <MemberFilterSheet
        open={sheet?.kind === "filter"}
        onClose={close}
        circles={circles}
        filter={filter}
        onChange={setFilter}
        resultCount={shown?.length ?? 0}
      />
      <MemberFormSheet
        open={sheet?.kind === "form"}
        onClose={close}
        circles={circles}
        member={sheet?.kind === "form" ? sheet.member : undefined}
      />
      <ConfirmSheet
        open={sheet?.kind === "delete"}
        title={sheet?.kind === "delete" ? `Delete ${sheet.member.name}?` : ""}
        confirmLabel="Delete member"
        onConfirm={() => sheet?.kind === "delete" && confirmDelete(sheet.member)}
        onClose={close}
      >
        They leave every circle. This can't be undone.
      </ConfirmSheet>
    </div>
  );
}
