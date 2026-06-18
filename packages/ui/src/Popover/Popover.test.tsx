import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Popover } from "./Popover";

function setup() {
  return render(
    <Popover trigger={<button>Open</button>} ariaLabel="Test panel">
      <p>Panel content</p>
    </Popover>,
  );
}

describe("Popover", () => {
  it("is closed by default", () => {
    setup();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens on trigger click", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog", { name: "Test panel" })).toBeInTheDocument();
  });

  it("toggles aria-expanded on the trigger", async () => {
    setup();
    const trigger = screen.getByRole("button", { name: "Open" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on outside click", async () => {
    render(
      <div>
        <Popover trigger={<button>Open</button>} ariaLabel="Test panel">
          <p>Panel content</p>
        </Popover>
        <button>Outside</button>
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no accessibility violations when open", async () => {
    const { container } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
