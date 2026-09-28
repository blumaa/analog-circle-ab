import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Avatar, avatarTone } from "./Avatar";

describe("Avatar", () => {
  it("renders an img with alt=name when src given", () => {
    render(<Avatar src="https://example.com/photo.jpg" name="Alice Johnson" />);
    expect(screen.getByRole("img", { name: "Alice Johnson" }).tagName).toBe("IMG");
  });

  it("falls back to the first initial", () => {
    render(<Avatar name="alice Johnson" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("falls back when src is null or empty", () => {
    render(<Avatar src="" name="Bob" />);
    expect(screen.getByRole("img", { name: "Bob" })).toHaveTextContent("B");
  });

  it("hides itself from assistive tech when decorative", () => {
    const { container } = render(
      <>
        <Avatar name="Alice" decorative />
        <Avatar name="Bob" src="https://example.com/b.jpg" decorative />
      </>,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("applies numeric size", () => {
    const { container } = render(<Avatar name="Alice" size={42} />);
    expect(container.firstChild).toHaveAttribute("data-size", "42");
  });

  it("defaults to size 30", () => {
    const { container } = render(<Avatar name="Alice" />);
    expect(container.firstChild).toHaveAttribute("data-size", "30");
  });

  it("uses an explicit tone when given", () => {
    const { container } = render(<Avatar name="Alice" tone={3} />);
    expect(container.firstChild).toHaveAttribute("data-tone", "3");
  });

  it("derives a stable tone 1–4 from the name", () => {
    const t = avatarTone("Maryam");
    expect(t).toBeGreaterThanOrEqual(1);
    expect(t).toBeLessThanOrEqual(4);
    expect(avatarTone("Maryam")).toBe(t);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Avatar name="Alice Johnson" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
