import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, IconButton } from "@analog/ui";
import { usePosts } from "../../data/hooks";
import type { Post } from "../../data/types";
import { useFeedContext } from "../../features/feed/useFeedContext";
import { eventsByDay, eventTone, monthGrid } from "../../lib/calendar";
import { formatMonthYear, toIsoDate } from "../../lib/dates";
import { isGoing } from "../../lib/feed";
import styles from "./CalendarPage.module.css";

const WEEKDAYS = [
  ["M", "Monday"],
  ["T", "Tuesday"],
  ["W", "Wednesday"],
  ["T", "Thursday"],
  ["F", "Friday"],
  ["S", "Saturday"],
  ["S", "Sunday"],
] as const;

const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const shiftMonth = (d: Date, by: number) => new Date(d.getFullYear(), d.getMonth() + by, 1);

export function CalendarPage() {
  const { ctx } = useFeedContext();
  const { data: posts } = usePosts();
  const [month, setMonth] = useState(() => firstOfMonth(new Date()));

  const byDay = ctx && posts ? eventsByDay(posts, ctx.viewerId, ctx.circles) : new Map<string, Post[]>();
  const weeks = monthGrid(month);
  const monthPrefix = toIsoDate(month).slice(0, 7);
  let count = 0;
  for (const [day, events] of byDay) if (day.startsWith(monthPrefix)) count += events.length;

  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="calendar-title">
        <div className={styles.header}>
          <IconButton label="Previous month" size={36} icon={<ChevronLeft size={18} />} onClick={() => setMonth(shiftMonth(month, -1))} />
          <IconButton label="Next month" size={36} icon={<ChevronRight size={18} />} onClick={() => setMonth(shiftMonth(month, 1))} />
          <h1 id="calendar-title" className={styles.title} aria-live="polite">
            {formatMonthYear(month)} ({count})
          </h1>
          <Button variant="outline" size="md" onClick={() => setMonth(firstOfMonth(new Date()))}>
            Today
          </Button>
        </div>
        <table className={styles.grid}>
          <thead>
            <tr>
              {WEEKDAYS.map(([short, long]) => (
                <th key={long} scope="col" className={styles.weekday}>
                  <abbr title={long}>{short}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={toIsoDate(week[0]!)}>
                {week.map((day) => {
                  const iso = toIsoDate(day);
                  return (
                    <td key={iso} className={styles.cell} data-outside={day.getMonth() !== month.getMonth() || undefined}>
                      <span className={styles.dayNumber}>{day.getDate()}</span>
                      {byDay.get(iso)?.map((post) => {
                        const going = !!ctx && isGoing(post.id, ctx.viewerId, ctx.rsvps);
                        return (
                          <Link
                            key={post.id}
                            to={`/events/${post.id}`}
                            className={styles.event}
                            data-going={going}
                            data-tone={ctx ? eventTone(post, ctx.viewerId, ctx.circles) : undefined}
                          >
                            <span className={styles.eventTitle}>{post.title}</span>
                            {going ? null : <span className={styles.srOnly}> (not going)</span>}
                          </Link>
                        );
                      })}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
