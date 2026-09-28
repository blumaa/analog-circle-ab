import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CheckboxTile } from "./CheckboxTile";

describe("CheckboxTile", () => {
  it("renders a labelled checkbox", () => {
    render(<CheckboxTile label="My Circle" checked onChange={() => {}} />);
    expect(screen.getByRole("checkbox", { name: "My Circle" })).toBeChecked();
  });

  it("reports the next value", async () => {
    const onChange = vi.fn();
    render(<CheckboxTile label="The Square" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<CheckboxTile label="My Circle" checked onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
