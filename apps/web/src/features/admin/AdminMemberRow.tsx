import { Pencil, Trash2 } from "lucide-react";
import { Avatar, IconButton } from "@analog/ui";
import type { Member } from "../../data/types";
import { InnerCircleBadge } from "../members/InnerCircleBadge";
import styles from "./AdminMemberRow.module.css";

export interface AdminMemberRowProps {
  member: Member;
  /** "IC4", or null when not placed. */
  innerCircle: string | null;
  /** "Admin · email" or "Member · joined Mar 2026". */
  meta: string;
  onEdit: () => void;
  onDelete: () => void;
}

/** One divided row in the admin member card. */
export function AdminMemberRow({ member, innerCircle, meta, onEdit, onDelete }: AdminMemberRowProps) {
  return (
    <li className={styles.row} aria-label={member.name}>
      <Avatar src={member.photoUrl} name={member.name} size={36} />
      <div className={styles.text}>
        <div className={styles.line}>
          <span className={styles.name}>{member.name}</span>
          <InnerCircleBadge label={innerCircle} />
        </div>
        <p className={styles.meta}>{meta}</p>
      </div>
      <IconButton label={`Edit ${member.name}`} size={30} icon={<Pencil size={14} />} onClick={onEdit} />
      <IconButton label={`Delete ${member.name}`} variant="danger" size={30} icon={<Trash2 size={14} />} onClick={onDelete} />
    </li>
  );
}
