import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { CalendarPage } from "./CalendarPage";

const renderCalendar = () => renderWithProviders(<CalendarPage />, { path: "/calendar", initialEntries: ["/calendar"] });

describe("CalendarPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 1, 12));
  });
  afterEach(() => vi.useRealTimers());

  it("shows this month's visible events with a count", async () => {
    const { container } = renderCalendar();
    expect(await screen.findByRole("link", { name: "IC4 dinner" })).toHaveAttribute("href", "/events/dinner-ic4-3");
    expect(screen.getByRole("heading", { name: "October 2026 (4)" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sunday brunch/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "IC1 dinner" })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks events the viewer isn't going to", async () => {
    renderCalendar();
    expect(await screen.findByRole("link", { name: "Story Circle #33 (not going)" })).toHaveAttribute("data-going", "false");
    expect(screen.getByRole("link", { name: "Zine night" })).toHaveAttribute("data-going", "true");
  });

  it("moves between months and back to today", async () => {
    const user = userEvent.setup();
    renderCalendar();
    await screen.findByRole("link", { name: "IC4 dinner" });
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("heading", { name: /^September 2026/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lake day at Liepnitzsee" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("heading", { name: /^November 2026/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("heading", { name: /^October 2026/ })).toBeInTheDocument();
  });
});
