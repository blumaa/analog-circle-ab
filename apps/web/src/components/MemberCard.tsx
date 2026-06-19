import { Link } from "react-router-dom";
import { Avatar, Button } from "@analog/ui";
import type { Member } from "../data";
import styles from "./MemberCard.module.css";

export interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const firstName = member.name.split(" ")[0] ?? member.name;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Avatar
          src={member.photoUrl}
          name={member.name}
          shape="rounded"
          aspect="1 / 1"
        />
      </div>
      <div className={styles.body}>
        <Link
          to={`/innercircle/members/${member.id}`}
          className={styles.nameLink}
          aria-label={member.name}
        >
          <p className={styles.name}>{member.name}</p>
        </Link>
        <div className={styles.actions}>
          {member.whatsappUrl != null && (
            <a
              href={member.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Whatsapp ${firstName}`}
              className={styles.actionLink}
            >
              <Button variant="success" size="sm" fullWidth>
                WhatsApp
              </Button>
            </a>
          )}
          <Link
            to={`/innercircle/members/${member.id}`}
            className={styles.actionLink}
            tabIndex={-1}
            aria-hidden="true"
          >
            <Button variant="soft" size="sm" fullWidth>
              More info
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
