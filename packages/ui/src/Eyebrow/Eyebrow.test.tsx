import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Eyebrow } from "./Eyebrow";

describe("Eyebrow", () => {
  it("renders an h2 by default", () => {
    render(<Eyebrow>Bio</Eyebrow>);
    expect(screen.getByRole("heading", { level: 2, name: "Bio" })).toHaveAttribute("data-tone", "muted");
  });

  it("renders as a paragraph with gold tone", () => {
    render(<Eyebrow as="p" tone="gold">Admin</Eyebrow>);
    const el = screen.getByText("Admin");
    expect(el.tagName).toBe("P");
    expect(el).toHaveAttribute("data-tone", "gold");
  });

  it("titles a fieldset as a legend", () => {
    render(
      <fieldset>
        <Eyebrow as="legend">Publish to</Eyebrow>
      </fieldset>,
    );
    expect(screen.getByRole("group", { name: "Publish to" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Eyebrow>Circles</Eyebrow>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
