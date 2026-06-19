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

  describe("static variant", () => {
    it("renders as a <span> when static is true", () => {
      const { container } = render(<Chip static>Hiking</Chip>);
      expect(container.querySelector("span.chip, span[class*='chip']")).not.toBeNull();
      expect(container.querySelector("button")).toBeNull();
    });

    it("does not have a button role when static", () => {
      render(<Chip static>Hiking</Chip>);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("has no accessibility violations when static", async () => {
      const { container } = render(<Chip static>Hiking</Chip>);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe("rose tone", () => {
    it("applies data-tone=rose to interactive chip", () => {
      render(<Chip tone="rose">Need</Chip>);
      expect(screen.getByRole("button", { name: "Need" })).toHaveAttribute("data-tone", "rose");
    });

    it("applies data-tone=rose to static chip", () => {
      const { container } = render(<Chip static tone="rose">Offer</Chip>);
      const span = container.querySelector("[data-tone='rose']");
      expect(span).not.toBeNull();
    });

    it("has no accessibility violations with rose tone", async () => {
      const { container } = render(<Chip tone="rose">Need</Chip>);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no accessibility violations with rose tone selected", async () => {
      const { container } = render(
        <Chip tone="rose" selected>
          Need
        </Chip>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
