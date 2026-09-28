import { Link } from "react-router-dom";
import { Avatar, BottomSheet } from "@analog/ui";
import type { Member } from "../../data/types";
import styles from "./PeopleSheet.module.css";

export interface PeopleSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  people: Member[];
  /** Trailing text per person, e.g. "3 posts". */
  note?: (member: Member) => string;
}

/** Bottom sheet listing members, each linking to their profile. */
export function PeopleSheet({ open, onClose, title, people, note }: PeopleSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <ul className={styles.list}>
        {people.map((m) => (
          <li key={m.id}>
            <Link to={`/members/${m.id}`} className={styles.person}>
              <Avatar name={m.name} src={m.photoUrl} size={30} decorative />
              <span className={styles.name}>{m.name}</span>
              {note && <span className={styles.note}>{note(m)}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
