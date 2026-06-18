import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Label } from "./Label";

describe("Label", () => {
  it("renders its children", () => {
    render(<Label>Coming up</Label>);
    expect(screen.getByText("Coming up")).toBeInTheDocument();
  });

  it("renders as a span by default", () => {
    render(<Label>When</Label>);
    expect(screen.getByText("When").tagName).toBe("SPAN");
  });

  it("renders as a div when as='div'", () => {
    render(<Label as="div">Address</Label>);
    expect(screen.getByText("Address").tagName).toBe("DIV");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Label>Coming up</Label>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
