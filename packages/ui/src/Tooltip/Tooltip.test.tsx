import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tooltip } from "./Tooltip";

function setup() {
  return render(
    <Tooltip content="Liked by Vki, Kasey">
      <button>Like</button>
    </Tooltip>,
  );
}

describe("Tooltip", () => {
  it("hides content by default", () => {
    setup();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows content on hover", async () => {
    setup();
    await userEvent.hover(screen.getByRole("button", { name: "Like" }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Liked by Vki, Kasey");
  });

  it("hides content on unhover", async () => {
    setup();
    const trigger = screen.getByRole("button", { name: "Like" });
    await userEvent.hover(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    await userEvent.unhover(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows content on keyboard focus", async () => {
    setup();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Like" })).toHaveFocus();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("links trigger to tooltip via aria-describedby when open", async () => {
    setup();
    const trigger = screen.getByRole("button", { name: "Like" });
    await userEvent.hover(trigger);
    const tooltip = screen.getByRole("tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("has no accessibility violations when open", async () => {
    const { container } = setup();
    await userEvent.hover(screen.getByRole("button", { name: "Like" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
