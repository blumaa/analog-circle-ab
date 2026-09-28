import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("is a searchbox named by its placeholder", () => {
    render(<SearchField value="" onChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveAttribute("placeholder", "Search");
  });

  it("uses an explicit label", () => {
    render(<SearchField value="" onChange={() => {}} label="Search members" />);
    expect(screen.getByRole("searchbox", { name: "Search members" })).toBeInTheDocument();
  });

  it("reports typed text", async () => {
    const onChange = vi.fn();
    render(<SearchField value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("searchbox"), "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SearchField value="" onChange={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
