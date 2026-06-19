import { Pencil } from "lucide-react";
import { Avatar, Button } from "@analog/ui";
import type { Member } from "../data";
import styles from "./ProfileHeader.module.css";

export interface ProfileHeaderProps {
  member: Member;
  /** Called when the user taps the pencil edit button. */
  onEdit?: () => void;
}

export function ProfileHeader({ member, onEdit }: ProfileHeaderProps) {
  return (
    <div className={styles.hero}>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Edit profile"
          onClick={onEdit}
          className={styles.editBtn}
        >
          <Pencil size={15} />
        </Button>
      )}

      <div className={styles.avatarRing}>
        <Avatar src={member.photoUrl} name={member.name} size="lg" className={styles.avatarLg} />
      </div>

      <div className={styles.identity}>
        <h2 className={styles.name}>{member.name}</h2>
        <p className={styles.email}>{member.email}</p>
      </div>
    </div>
  );
}
