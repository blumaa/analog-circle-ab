import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders its label as a button", () => {
    render(<Chip>My Circle</Chip>);
    expect(screen.getByRole("button", { name: "My Circle" })).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-pressed=true when selected", () => {
    render(<Chip selected>My Circle</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults to toggle select style", () => {
    render(<Chip>Event</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("data-select-style", "toggle");
  });

  it("shows a leading check when a toggle chip is selected", () => {
    const { container } = render(<Chip selected>Event</Chip>);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(screen.getByRole("button")).toHaveAttribute("data-has-lead", "true");
  });

  it("shows no check for a selected single chip", () => {
    const { container } = render(
      <Chip selected selectStyle="single">
        All
      </Chip>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Post</Chip>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders count when given", () => {
    render(<Chip count={3}>Inner</Chip>);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders as a span when static", () => {
    const { container } = render(<Chip static>Berlin</Chip>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <Chip selected>Event</Chip>
        <Chip selectStyle="single" selected>
          All
        </Chip>
        <Chip static>Berlin</Chip>
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
