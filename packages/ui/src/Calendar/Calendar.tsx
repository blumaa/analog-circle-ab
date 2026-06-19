import { useCallback, useMemo } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type View,
  type ToolbarProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "../Button/Button";
import styles from "./Calendar.module.css";

/** Color tone for an event pill. Generic — the consumer maps its own meaning. */
export type CalendarEventTone = "accent" | "info";

/** A single calendar entry. Generic and presentational — no domain coupling. */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  /** Pill color. Defaults to "accent" (gold). */
  tone?: CalendarEventTone;
}

export type CalendarView = "month" | "week";

/** Per-tone CSS custom properties consumed by .rbc-event in the stylesheet. */
const TONE_VARS: Record<CalendarEventTone, Record<string, string>> = {
  accent: {
    "--cal-event-bg": "var(--color-accent)",
    "--cal-event-ink": "var(--color-on-accent)",
    "--cal-event-bg-strong": "var(--color-accent-bright)",
  },
  info: {
    "--cal-event-bg": "var(--color-info)",
    "--cal-event-ink": "var(--color-on-accent)",
    "--cal-event-bg-strong": "var(--color-info)",
  },
};

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
 * Custom toolbar: navigation (Today/Back/Next) + the period label only.
 * The view switcher is intentionally omitted — the consumer owns the view
 * (e.g. via its own segmented control), so rbc's built-in Month/Week buttons
 * would be a confusing duplicate.
 */
function CalendarToolbar({ label, onNavigate }: ToolbarProps<CalendarEvent>) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.nav}>
        <Button variant="soft" size="sm" onClick={() => onNavigate("TODAY")}>
          Today
        </Button>
        <Button variant="soft" size="sm" onClick={() => onNavigate("PREV")}>
          Back
        </Button>
        <Button variant="soft" size="sm" onClick={() => onNavigate("NEXT")}>
          Next
        </Button>
      </div>
      <span className={styles.toolbarLabel}>{label}</span>
    </div>
  );
}

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
  const components = useMemo(() => ({ toolbar: CalendarToolbar }), []);

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({ style: TONE_VARS[event.tone ?? "accent"] }),
    [],
  );

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
        eventPropGetter={eventPropGetter}
        components={components}
        popup
        style={{ height: "70vh", minHeight: 480 }}
      />
    </div>
  );
}
