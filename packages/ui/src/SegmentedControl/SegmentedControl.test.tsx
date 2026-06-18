import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SegmentedControl } from "./SegmentedControl";

const options = [
  { value: "all", label: "All", count: 12 },
  { value: "needs", label: "Needs", count: 4 },
  { value: "offers", label: "Offers", count: 8 },
];

describe("SegmentedControl", () => {
  it("renders all options as buttons", () => {
    render(<SegmentedControl options={options} value="all" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /All/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Needs/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Offers/ })).toBeInTheDocument();
  });

  it("marks the active option aria-pressed=true", () => {
    render(<SegmentedControl options={options} value="needs" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Needs/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /All/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the value when an option is clicked", async () => {
    const onChange = vi.fn();
    render(<SegmentedControl options={options} value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /Offers/ }));
    expect(onChange).toHaveBeenCalledWith("offers");
  });

  it("renders count bubbles", () => {
    render(<SegmentedControl options={options} value="all" onChange={vi.fn()} />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders as a group with ariaLabel", () => {
    render(
      <SegmentedControl
        options={options}
        value="all"
        onChange={vi.fn()}
        ariaLabel="Filter posts"
      />,
    );
    expect(screen.getByRole("group", { name: "Filter posts" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SegmentedControl
        options={options}
        value="all"
        onChange={vi.fn()}
        ariaLabel="Filter posts"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
