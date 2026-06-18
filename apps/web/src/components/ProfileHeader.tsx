import { Avatar } from "@analog/ui";
import type { Member } from "../data";
import styles from "./ProfileHeader.module.css";

export interface ProfileHeaderProps {
  member: Member;
}

export function ProfileHeader({ member }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.avatarRing}>
        <Avatar src={member.photoUrl} name={member.name} size="lg" />
      </div>
      <h2 className={styles.name}>{member.name}</h2>
      <p className={styles.email}>{member.email}</p>
    </div>
  );
}
