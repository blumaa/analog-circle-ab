import { Link } from "react-router-dom";
import { Avatar, Button, Card, CardBody } from "@analog/ui";
import type { Member } from "../data";
import styles from "./MemberCard.module.css";

export interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const firstName = member.name.split(" ")[0] ?? member.name;

  return (
    <Card>
      <CardBody className={styles.body}>
        {/* Primary link wraps photo + name. Kept as a sibling of the
            WhatsApp action so we never nest <a> inside <a>. */}
        <Link
          to={`/innercircle/members/${member.id}`}
          className={styles.memberLink}
        >
          <Avatar
            src={member.photoUrl}
            name={member.name}
            shape="rounded"
            aspect="1 / 1"
          />
          <p className={styles.name}>{member.name}</p>
        </Link>

        {member.whatsappUrl != null && (
          <a
            href={member.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Whatsapp ${firstName}`}
            className={styles.whatsappLink}
          >
            <Button variant="success" fullWidth>
              WHATSAPP
            </Button>
          </a>
        )}
      </CardBody>
    </Card>
  );
}
