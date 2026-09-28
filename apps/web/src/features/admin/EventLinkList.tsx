import { Link } from "react-router-dom";
import type { Post } from "../../data/types";
import { formatDay, fromIsoDate } from "../../lib/dates";
import styles from "./EventLinkList.module.css";

export interface EventLinkListProps {
  events: Post[];
  label: string;
}

/** Events as links with their date. */
export function EventLinkList({ events, label }: EventLinkListProps) {
  return (
    <ul className={styles.list} aria-label={label}>
      {events.map((e) => (
        <li key={e.id}>
          <Link to={`/events/${e.id}`} className={styles.event}>
            <span className={styles.title}>{e.title}</span>
            {e.event?.date && <span className={styles.date}>{formatDay(fromIsoDate(e.event.date))}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
