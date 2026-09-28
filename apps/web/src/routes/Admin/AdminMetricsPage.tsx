import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { BottomSheet, Chip } from "@analog/ui";
import { useActivity, useCircles, useMembers, usePosts, useRsvps } from "../../data/hooks";
import type { Activity, Circle, Member, Post, Rsvp } from "../../data/types";
import { EventLinkList } from "../../features/admin/EventLinkList";
import { MemberHistory } from "../../features/admin/MemberHistory";
import { StatTile } from "../../features/admin/StatTile";
import { CircleTree } from "../../features/circles/CircleTree";
import { PeopleSheet } from "../../features/members/PeopleSheet";
import { FOUNDED_AT } from "../../lib/community";
import { formatWeekRange } from "../../lib/dates";
import {
  innerCircleHealth,
  periodStats,
  PERIODS,
  treeAge,
  weekRange,
  weekStats,
  type MemberCount,
  type MissedDinners,
} from "../../lib/metrics";
import pageStyles from "./AdminPage.module.css";
import styles from "./AdminMetricsPage.module.css";

type OpenSheet = "experiences" | "newMembers" | "inactive" | "creators" | "active" | null;

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** Maps ranked counts to members plus a lookup for the sheet note. */
function ranked(list: MemberCount[], unit: string) {
  const counts = new Map(list.map((c) => [c.member.id, c.count]));
  return { people: list.map((c) => c.member), note: (m: Member) => plural(counts.get(m.id) ?? 0, unit) };
}

function MissedList({ label, rows, empty }: { label: string; rows: MissedDinners[]; empty: string }) {
  if (rows.length === 0) return <p className={styles.muted}>{empty}</p>;
  return (
    <ul className={styles.missed} aria-label={label}>
      {rows.map(({ member, circle }) => (
        <li key={member.id} className={styles.missedRow}>
          <span>{member.name}</span>
          <span className={styles.muted}>{circle.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function AdminMetricsPage() {
  const { data: members } = useMembers();
  const { data: circles } = useCircles();
  const { data: posts } = usePosts();
  const { data: rsvps } = useRsvps();
  const { data: activity } = useActivity();
  // Metrics from partial data would be wrong, so wait for every query.
  if (!members || !circles || !posts || !rsvps || !activity) return null;
  return <Metrics members={members} circles={circles} posts={posts} rsvps={rsvps} activity={activity} />;
}

interface MetricsProps {
  members: Member[];
  circles: Circle[];
  posts: Post[];
  rsvps: Rsvp[];
  activity: Activity[];
}

function Metrics({ members, circles, posts, rsvps, activity }: MetricsProps) {
  const [days, setDays] = useState<number>(30);
  const [sheet, setSheet] = useState<OpenSheet>(null);

  const now = new Date();
  const age = treeAge(FOUNDED_AT, now);
  const { from, to } = weekRange(now);
  const week = weekStats(members, posts, rsvps, now);
  const period = periodStats(members, posts, rsvps, activity, days, now);
  const health = innerCircleHealth(members, circles, posts, rsvps, now);
  const creators = ranked(period.creators, "post");
  const active = ranked(period.active, "action");
  const close = () => setSheet(null);

  const periodRows = [
    { key: "inactive", label: "Inactive", count: period.inactive.length },
    { key: "creators", label: "Most active creators", count: period.creators.length },
    { key: "active", label: "Most active members", count: period.active.length },
  ] as const;

  return (
    <div className={pageStyles.page}>
      <section className={`${styles.panel} ${styles.tree}`} aria-label="TAC's tree">
        <CircleTree imageUrl={null} size={180} />
        <p className={styles.treeAge}>
          {age.stage} · {age.months} months old
        </p>
        <p className={styles.muted}>TAC's tree grows every week.</p>
      </section>

      <h1 className={styles.title}>Product metrics</h1>

      <section className={styles.week} aria-labelledby="metrics-week">
        <h2 id="metrics-week" className={styles.weekTitle}>
          This week
        </h2>
        <p className={styles.muted}>{formatWeekRange(from, to)} · Berlin time</p>
        <div className={styles.grid}>
          <StatTile label="New members" value={week.newMembers.length} onOpen={() => setSheet("newMembers")} />
          <StatTile label="Experiences" value={week.experiences.length} onOpen={() => setSheet("experiences")} />
          <StatTile label="Going" value={week.going} pct={week.goingPct} caption="unique members" />
          <StatTile label="Cancellations" value={week.cancellations} pct={week.cancellationPct} caption="unique members" />
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="metrics-period">
        <h2 id="metrics-period" className={styles.srOnly}>
          Members by period
        </h2>
        <div className={styles.chips} role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <Chip key={p.days} selectStyle="single" selected={p.days === days} aria-pressed={p.days === days} onClick={() => setDays(p.days)}>
              {p.label}
            </Chip>
          ))}
        </div>
        <ul className={styles.rows}>
          {periodRows.map((row) => (
            <li key={row.key}>
              <button type="button" className={styles.row} aria-label={`${row.label}: ${row.count}`} onClick={() => setSheet(row.key)}>
                <span>{row.label}</span>
                <span className={styles.count}>{row.count}</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel} aria-labelledby="metrics-health">
        <h2 id="metrics-health" className={styles.cardTitle}>
          Inner Circle health
        </h2>
        <p className={styles.muted}>
          Consecutive missed circle dinners. 2 in a row gets a check-in email. 3 in a row is a WhatsApp list to Bolu, not an email to the member.
        </p>
        <h3 className={styles.subTitle}>Missed 2 dinners in a row</h3>
        <p className={styles.muted}>
          Last 2 circle dinners were a cancellation or a recorded no-show. Each gets one check-in email the morning after the second miss is
          recorded, as long as their circle has a next dinner scheduled. Anyone marked not emailed needs a personal nudge.
        </p>
        <MissedList label="Missed 2 dinners in a row" rows={health.missed2} empty="Nobody has missed 2 in a row." />
        <h3 className={`${styles.subTitle} ${styles.divided}`}>Missed 3 dinners in a row</h3>
        <p className={styles.muted}>
          Last 3 circle dinners were a cancellation or a recorded no-show. Bolu gets a WhatsApp list by email so he can follow up. Members are
          not emailed.
        </p>
        <MissedList label="Missed 3 dinners in a row" rows={health.missed3} empty="Nobody has missed 3 in a row." />
      </section>

      <section className={styles.panel} aria-labelledby="metrics-members">
        <h2 id="metrics-members" className={styles.cardTitle}>
          Members
        </h2>
        <p className={styles.muted}>Search anyone in the community and see every experience they have been to.</p>
        <MemberHistory members={members} posts={posts} rsvps={rsvps} now={now} />
      </section>

      <BottomSheet open={sheet === "experiences"} onClose={close} title="Experiences this week">
        <EventLinkList events={week.experiences} label="Experiences this week" />
      </BottomSheet>
      <PeopleSheet open={sheet === "newMembers"} onClose={close} title="New members this week" people={week.newMembers} />
      <PeopleSheet open={sheet === "inactive"} onClose={close} title="Inactive members" people={period.inactive} />
      <PeopleSheet open={sheet === "creators"} onClose={close} title="Most active creators" {...creators} />
      <PeopleSheet open={sheet === "active"} onClose={close} title="Most active members" {...active} />
    </div>
  );
}
