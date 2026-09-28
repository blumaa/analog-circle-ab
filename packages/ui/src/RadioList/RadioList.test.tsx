import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RadioList } from "./RadioList";

const options = [
  { value: "newest", label: "Newest" },
  { value: "soonest", label: "Soonest" },
];

describe("RadioList", () => {
  it("renders a named radiogroup with the value checked", () => {
    render(<RadioList label="Sort by" options={options} value="newest" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Sort by" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Newest" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Soonest" })).not.toBeChecked();
  });

  it("reports the chosen value", async () => {
    const onChange = vi.fn();
    render(<RadioList label="Sort by" options={options} value="newest" onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Soonest" }));
    expect(onChange).toHaveBeenCalledWith("soonest");
  });

  it("supports the chips variant", () => {
    render(<RadioList label="Type" variant="chips" options={options} value="newest" onChange={() => {}} />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("data-variant", "chips");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<RadioList label="Sort by" options={options} value="newest" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
