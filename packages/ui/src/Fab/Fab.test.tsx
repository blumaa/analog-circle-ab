import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Plus } from "lucide-react";
import { Fab } from "./Fab";

describe("Fab", () => {
  it("renders with accessible label", () => {
    render(<Fab icon={<Plus />} aria-label="New event" />);
    expect(screen.getByRole("button", { name: "New event" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Fab icon={<Plus />} aria-label="New event" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "New event" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(<Fab icon={<Plus />} aria-label="New event" onClick={onClick} disabled />);
    await userEvent.click(screen.getByRole("button", { name: "New event" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Fab icon={<Plus />} aria-label="New event" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
