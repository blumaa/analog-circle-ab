import { useId } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2, UserPlus } from "lucide-react";
import { Avatar, IconButton, useToast } from "@analog/ui";
import { useSetCircleMembership } from "../../data/hooks";
import type { Circle, Member } from "../../data/types";
import styles from "./AdminCircleRow.module.css";

export interface AdminCircleRowProps {
  circle: Circle;
  /** Meta line, e.g. "Inner · 7 of 7 members · next dinner Fri 23 Oct". */
  meta: string;
  members: Member[];
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddMember: () => void;
}

/** Admin circle card: edit, delete, and an expandable member list. */
export function AdminCircleRow({ circle, meta, members, expanded, onToggle, onEdit, onDelete, onAddMember }: AdminCircleRowProps) {
  const listId = useId();
  const setMembership = useSetCircleMembership();
  const toast = useToast();
  const inCircle = members.filter((m) => circle.memberIds.includes(m.id));
  const Chevron = expanded ? ChevronUp : ChevronDown;

  const remove = (member: Member) =>
    setMembership.mutate(
      { circleId: circle.id, memberId: member.id, member: false },
      { onSuccess: () => toast.success(`Removed ${member.name} from ${circle.name}`) },
    );

  return (
    <article className={styles.row} aria-label={circle.name} data-expanded={expanded || undefined}>
      <div className={styles.header}>
        <div className={styles.text}>
          <h2 className={styles.name}>{circle.name}</h2>
          <p className={styles.meta}>{meta}</p>
        </div>
        <IconButton label={`Edit ${circle.name}`} size={32} icon={<Pencil size={15} />} onClick={onEdit} />
        <IconButton label={`Delete ${circle.name}`} variant="danger" size={32} icon={<Trash2 size={15} />} onClick={onDelete} />
        <IconButton
          label={`Show members of ${circle.name}`}
          variant="ghost"
          size={32}
          icon={<Chevron size={18} />}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={onToggle}
        />
      </div>
      <div id={listId} className={styles.body} hidden={!expanded}>
        {expanded && (
          <>
            <ul className={styles.members} aria-label={`${circle.name} members`}>
              {inCircle.map((m) => (
                <li key={m.id} className={styles.member}>
                  <Avatar src={m.photoUrl} name={m.name} size={28} />
                  <span className={styles.memberName}>{m.name}</span>
                  <button type="button" className={styles.remove} aria-label={`Remove ${m.name}`} onClick={() => remove(m)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className={styles.add} onClick={onAddMember}>
              <UserPlus size={15} aria-hidden="true" />
              Add member
            </button>
          </>
        )}
      </div>
    </article>
  );
}
