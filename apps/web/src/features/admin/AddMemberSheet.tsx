import { useState } from "react";
import { Avatar, BottomSheet, SearchField, useToast } from "@analog/ui";
import { useSetCircleMembership } from "../../data/hooks";
import type { Circle, Member } from "../../data/types";
import { innerCircleLabel } from "../../lib/circles";
import { InnerCircleBadge } from "../members/InnerCircleBadge";
import styles from "./AddMemberSheet.module.css";

export interface AddMemberSheetProps {
  circle: Circle | null;
  circles: Circle[];
  members: Member[];
  onClose: () => void;
}

/** Pick a member to add to a circle. Mounts fresh each open so the search resets. */
export function AddMemberSheet({ circle, circles, members, onClose }: AddMemberSheetProps) {
  return (
    <BottomSheet open={!!circle} onClose={onClose} title={circle ? `Add to ${circle.name}` : ""}>
      {circle && <Picker circle={circle} circles={circles} members={members} onClose={onClose} />}
    </BottomSheet>
  );
}

function Picker({ circle, circles, members, onClose }: AddMemberSheetProps & { circle: Circle }) {
  const [query, setQuery] = useState("");
  const setMembership = useSetCircleMembership();
  const toast = useToast();
  const needle = query.trim().toLocaleLowerCase();
  const candidates = members.filter(
    (m) => !circle.memberIds.includes(m.id) && (!needle || m.name.toLocaleLowerCase().includes(needle)),
  );

  const add = (member: Member) =>
    setMembership.mutate(
      { circleId: circle.id, memberId: member.id, member: true },
      {
        onSuccess: () => {
          toast.success(`Added ${member.name} to ${circle.name}`);
          onClose();
        },
      },
    );

  return (
    <div className={styles.picker}>
      <SearchField value={query} onChange={setQuery} placeholder="Search members" />
      <ul className={styles.list}>
        {candidates.map((m) => (
          <li key={m.id}>
            <button type="button" className={styles.option} onClick={() => add(m)}>
              <Avatar src={m.photoUrl} name={m.name} size={28} />
              <span className={styles.name}>{m.name}</span>
              <InnerCircleBadge label={innerCircleLabel(circles, m.id)} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
