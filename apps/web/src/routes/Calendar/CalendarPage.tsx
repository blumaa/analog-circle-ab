import { useState } from "react";
import { Header, SegmentedControl } from "@analog/ui";
import { EventCalendar, type EventCalendarView } from "../../components/EventCalendar";
import type { Scope } from "../../data";
import styles from "./CalendarPage.module.css";

const SCOPE_OPTIONS = [
  { value: "analog", label: "Analog Circle" },
  { value: "inner", label: "Inner Circle" },
];

const VIEW_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "list", label: "List" },
];

export function CalendarPage() {
  const [scope, setScope] = useState<Scope>("analog");
  const [view, setView] = useState<EventCalendarView>("month");

  return (
    <div className={styles.page}>
      <Header title="Calendar" eyebrow="Community" />

      <div className={styles.controls}>
        <SegmentedControl
          ariaLabel="Calendar scope"
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={(v) => setScope(v as Scope)}
        />
        <SegmentedControl
          ariaLabel="Calendar view"
          options={VIEW_OPTIONS}
          value={view}
          onChange={(v) => setView(v as EventCalendarView)}
        />
      </div>

      <EventCalendar scope={scope} view={view} />
    </div>
  );
}
