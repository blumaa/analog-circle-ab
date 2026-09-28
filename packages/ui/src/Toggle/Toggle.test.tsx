import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("renders a switch with its label", () => {
    render(<Toggle label="Reminders" checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch", { name: "Reminders" })).toHaveAttribute("aria-checked", "false");
  });

  it("reports checked state", () => {
    render(<Toggle label="Reminders" checked onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with the next value", async () => {
    const onChange = vi.fn();
    render(<Toggle label="Reminders" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("locked: always on, cannot change", async () => {
    const onChange = vi.fn();
    render(<Toggle label="Replies" locked onChange={onChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(sw).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(sw);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Toggle label="Reminders" checked onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
