import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders its label as a button", () => {
    render(<Chip>Offers</Chip>);
    expect(screen.getByRole("button", { name: "Offers" })).toBeInTheDocument();
  });

  it("has aria-pressed=false when unselected", () => {
    render(<Chip>Offers</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-pressed=true when selected", () => {
    render(<Chip selected>Offers</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Offers</Chip>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders count bubble when count is provided", () => {
    render(<Chip count={5}>Offers</Chip>);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render count bubble when count is omitted", () => {
    render(<Chip>Offers</Chip>);
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Chip>Offers</Chip>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations when selected with count", async () => {
    const { container } = render(
      <Chip selected count={3}>
        Needs
      </Chip>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
