import { useCallback, useMemo } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "./Calendar.module.css";

/** A single calendar entry. Generic and presentational — no domain coupling. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export type CalendarView = "month" | "week";

export interface CalendarProps {
  events: CalendarEvent[];
  /** The active view. Driven by the consumer. */
  view: CalendarView;
  /** Fires when the user requests a different view via the toolbar. */
  onView?: (view: CalendarView) => void;
  /** The date the calendar is focused on (controls month/week shown). */
  date?: Date;
  /** Fires when the user navigates (prev/next/today). */
  onNavigate?: (date: Date) => void;
  /** Fires with the event id when an event pill is clicked. */
  onSelectEvent?: (id: string) => void;
  className?: string;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { "en-US": enUS },
});

/** Only month + week are offered. */
const VIEWS: View[] = ["month", "week"];

/**
 * Themed, presentational wrapper around react-big-calendar.
 * The consumer owns the view + date and reacts to selection.
 */
export function Calendar({
  events,
  view,
  onView,
  date,
  onNavigate,
  onSelectEvent,
  className,
}: CalendarProps) {
  const handleView = useCallback(
    (v: View) => {
      if (v === "month" || v === "week") onView?.(v);
    },
    [onView],
  );

  const handleNavigate = useCallback(
    (next: Date) => onNavigate?.(next),
    [onNavigate],
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => onSelectEvent?.(event.id),
    [onSelectEvent],
  );

  // react-big-calendar mutates props defensively; memoise to keep referential stability.
  const calendarEvents = useMemo(() => events, [events]);

  return (
    <div className={[styles.calendar, className].filter(Boolean).join(" ")}>
      <BigCalendar<CalendarEvent>
        localizer={localizer}
        culture="en-US"
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        view={view}
        views={VIEWS}
        date={date}
        onView={handleView}
        onNavigate={handleNavigate}
        onSelectEvent={handleSelectEvent}
        popup
        style={{ height: "70vh", minHeight: 480 }}
      />
    </div>
  );
}
