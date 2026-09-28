import { useId } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, ButtonLink, Chip } from "@analog/ui";
import type { Circle, Member } from "../../data/types";
import { innerCircleLabel } from "../../lib/circles";
import { memberContacts } from "../../lib/contacts";
import { shortName } from "../../lib/names";
import type { ListView } from "../lists/ListToolbar";
import { ContactLinks } from "./ContactLinks";
import { InnerCircleBadge } from "./InnerCircleBadge";
import styles from "./MemberRow.module.css";

export interface MemberRowProps {
  member: Member;
  circles: Circle[];
  expanded: boolean;
  onToggle: () => void;
  view?: ListView;
}

/** Collapsible directory card. The whole header toggles; contact links sit above the toggle. */
export function MemberRow({ member, circles, expanded, onToggle, view = "cards" }: MemberRowProps) {
  const detailsId = useId();
  const name = shortName(member.name);
  const ic = innerCircleLabel(circles, member.id);
  const memberCircles = circles.filter((c) => c.type !== "inner" && c.memberIds.includes(member.id));
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <li className={styles.row} data-view={view} data-expanded={expanded || undefined}>
      <div className={styles.header}>
        <Avatar src={member.photoUrl} name={member.name} size={view === "cards" ? 42 : 30} />
        <div className={styles.identity}>
          <span className={styles.name} aria-hidden="true">
            {name}
          </span>
          {ic && <InnerCircleBadge label={ic} />}
        </div>
        {view === "cards" && <ContactLinks contacts={memberContacts(member)} name={name} />}
        <button
          type="button"
          className={styles.toggle}
          aria-label={name}
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          <Chevron size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      <div id={detailsId} className={styles.details} hidden={!expanded}>
        {expanded && (
          <>
            {member.bio && <p className={styles.bio}>{member.bio}</p>}
            {memberCircles.length > 0 && (
              <ul className={styles.chips} aria-label="Circles">
                {memberCircles.map((c) => (
                  <li key={c.id}>
                    <Chip static>{c.name}</Chip>
                  </li>
                ))}
              </ul>
            )}
            <ButtonLink as={Link} to={`/members/${member.id}`} variant="tint" size="sm" className={styles.more}>
              More details
            </ButtonLink>
          </>
        )}
      </div>
    </li>
  );
}
