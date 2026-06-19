import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar, type CalendarEvent } from "./Calendar";

const date = new Date(2026, 6, 1); // July 2026

const events: CalendarEvent[] = [
  {
    id: "e1",
    title: "Summer picnic",
    start: new Date(2026, 6, 4, 16, 0),
    end: new Date(2026, 6, 4, 19, 0),
  },
  {
    id: "e2",
    title: "Photography walk",
    start: new Date(2026, 6, 12, 10, 0),
    end: new Date(2026, 6, 12, 12, 0),
  },
];

describe("Calendar", () => {
  it("renders events on the grid", () => {
    render(<Calendar events={events} view="month" date={date} />);
    expect(screen.getByText("Summer picnic")).toBeInTheDocument();
    expect(screen.getByText("Photography walk")).toBeInTheDocument();
  });

  it("fires onSelectEvent with the event id when a pill is clicked", async () => {
    const onSelectEvent = vi.fn();
    render(
      <Calendar
        events={events}
        view="month"
        date={date}
        onSelectEvent={onSelectEvent}
      />,
    );
    await userEvent.click(screen.getByText("Summer picnic"));
    expect(onSelectEvent).toHaveBeenCalledWith("e1");
  });

  it("renders the month toolbar label", () => {
    render(<Calendar events={events} view="month" date={date} />);
    expect(screen.getByText(/July 2026/)).toBeInTheDocument();
  });

  it("renders nav controls and omits the duplicate view switcher", () => {
    render(<Calendar events={events} view="month" date={date} />);
    expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    // The consumer owns the view (Month/Week), so the toolbar must NOT duplicate it.
    expect(screen.queryByRole("button", { name: /^week$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^month$/i })).not.toBeInTheDocument();
  });

  it("calls onNavigate when Next is pressed", async () => {
    const onNavigate = vi.fn();
    render(
      <Calendar events={events} view="month" date={date} onNavigate={onNavigate} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onNavigate).toHaveBeenCalled();
  });
});
