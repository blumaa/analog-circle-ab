import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tabs } from "./Tabs";

const tabs = [
  { value: "calendar", label: "Calendar" },
  { value: "members", label: "Members" },
  { value: "map", label: "Map" },
  { value: "food", label: "Food" },
];

describe("Tabs", () => {
  it("renders a tablist", () => {
    render(<Tabs tabs={tabs} value="calendar" onChange={vi.fn()} ariaLabel="Page sections" />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("renders each tab with role=tab", () => {
    render(<Tabs tabs={tabs} value="calendar" onChange={vi.fn()} ariaLabel="Page sections" />);
    expect(screen.getByRole("tab", { name: "Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Members" })).toBeInTheDocument();
  });

  it("marks the active tab aria-selected=true", () => {
    render(<Tabs tabs={tabs} value="members" onChange={vi.fn()} ariaLabel="Page sections" />);
    expect(screen.getByRole("tab", { name: "Members" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Calendar" })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange when a tab is clicked", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="calendar" onChange={onChange} ariaLabel="Page sections" />);
    await userEvent.click(screen.getByRole("tab", { name: "Map" }));
    expect(onChange).toHaveBeenCalledWith("map");
  });

  it("applies accessible name to tablist via ariaLabel", () => {
    render(<Tabs tabs={tabs} value="calendar" onChange={vi.fn()} ariaLabel="Page sections" />);
    expect(screen.getByRole("tablist", { name: "Page sections" })).toBeInTheDocument();
  });

  it("navigates with arrow keys", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="calendar" onChange={onChange} ariaLabel="Page sections" />);
    screen.getByRole("tab", { name: "Calendar" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("members");
  });

  it("wraps arrow navigation from last to first", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="food" onChange={onChange} ariaLabel="Page sections" />);
    screen.getByRole("tab", { name: "Food" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("calendar");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Tabs tabs={tabs} value="calendar" onChange={vi.fn()} ariaLabel="Page sections" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
