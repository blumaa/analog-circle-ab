import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ReactionPill } from "./ReactionPill";

describe("ReactionPill", () => {
  it("shows pressed state when active", () => {
    render(<ReactionPill active>🎉 4</ReactionPill>);
    expect(screen.getByRole("button", { name: "🎉 4" })).toHaveAttribute("aria-pressed", "true");
  });

  it("defaults to size 28", () => {
    render(<ReactionPill>🎉 4</ReactionPill>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "28");
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<ReactionPill onClick={onClick}>❤️ 2</ReactionPill>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ReactionPill active={false}>🎉 4</ReactionPill>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
