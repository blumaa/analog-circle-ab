import { useState } from "react";
import { SearchField } from "@analog/ui";
import type { Member, Post, Rsvp } from "../../data/types";
import { experiencesAttended } from "../../lib/metrics";
import { EventLinkList } from "./EventLinkList";
import styles from "./MemberHistory.module.css";

export interface MemberHistoryProps {
  members: Member[];
  posts: Post[];
  rsvps: Rsvp[];
  now: Date;
}

const MAX_MATCHES = 6;

/** Search a member, then show every experience they went to. */
export function MemberHistory({ members, posts, rsvps, now }: MemberHistoryProps) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const needle = query.trim().toLocaleLowerCase();
  const matches = needle ? members.filter((m) => m.name.toLocaleLowerCase().includes(needle)).slice(0, MAX_MATCHES) : [];
  const selected = members.find((m) => m.id === selectedId) ?? null;
  const history = selected ? experiencesAttended(selected.id, posts, rsvps, now) : [];

  const search = (value: string) => {
    setQuery(value);
    setSelectedId(null);
  };

  return (
    <div className={styles.history}>
      <SearchField value={query} onChange={search} label="Search members" placeholder="Search members…" />
      {!needle && <p className={styles.hint}>Type a name to see what they have been to.</p>}
      {needle && !selected && (
        <ul className={styles.matches}>
          {matches.map((m) => (
            <li key={m.id}>
              <button type="button" className={styles.match} onClick={() => setSelectedId(m.id)}>
                {m.name}
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className={styles.hint}>No members match.</li>}
        </ul>
      )}
      {selected && (
        <>
          <p className={styles.summary}>
            {history.length === 1 ? "1 experience attended" : `${history.length} experiences attended`}
          </p>
          <EventLinkList events={history} label={`Experiences ${selected.name} attended`} />
        </>
      )}
    </div>
  );
}
