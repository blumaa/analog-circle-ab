import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar, type CalendarEvent, type CalendarView } from "./Calendar";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const focus = new Date(2026, 6, 1); // July 2026

const sampleEvents: CalendarEvent[] = [
  {
    id: "mixer",
    title: "Analog Circle mixer",
    start: new Date(2026, 6, 2, 18, 0),
    end: new Date(2026, 6, 2, 21, 0),
  },
  {
    id: "picnic",
    title: "Summer picnic",
    start: new Date(2026, 6, 4, 16, 0),
    end: new Date(2026, 6, 4, 19, 0),
  },
  {
    id: "walk",
    title: "Photography walk",
    start: new Date(2026, 6, 12, 10, 0),
    end: new Date(2026, 6, 12, 12, 0),
  },
];

function ControlledCalendar({ initialView }: { initialView: CalendarView }) {
  const [view, setView] = useState<CalendarView>(initialView);
  const [date, setDate] = useState<Date>(focus);
  return (
    <Calendar
      events={sampleEvents}
      view={view}
      onView={setView}
      date={date}
      onNavigate={setDate}
      onSelectEvent={(id) => console.log("selected", id)}
    />
  );
}

export const Month: Story = {
  args: { events: sampleEvents, view: "month", date: focus },
  render: () => <ControlledCalendar initialView="month" />,
};

export const Week: Story = {
  args: { events: sampleEvents, view: "week", date: focus },
  render: () => <ControlledCalendar initialView="week" />,
};
