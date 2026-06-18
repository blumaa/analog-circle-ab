import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Need</Badge>);
    expect(screen.getByText("Need")).toBeInTheDocument();
  });

  it("renders as a span", () => {
    render(<Badge>Offer</Badge>);
    expect(screen.getByText("Offer").tagName).toBe("SPAN");
  });

  it("defaults to the neutral variant", () => {
    render(<Badge>Plain</Badge>);
    expect(screen.getByText("Plain")).toHaveAttribute("data-variant", "neutral");
  });

  it("applies the variant as a data attribute", () => {
    render(<Badge variant="meeting">Meeting</Badge>);
    expect(screen.getByText("Meeting")).toHaveAttribute("data-variant", "meeting");
  });

  it("applies the danger variant", () => {
    render(<Badge variant="danger">Need</Badge>);
    expect(screen.getByText("Need")).toHaveAttribute("data-variant", "danger");
  });

  it("applies the accent variant", () => {
    render(<Badge variant="accent">Hosting</Badge>);
    expect(screen.getByText("Hosting")).toHaveAttribute("data-variant", "accent");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Badge variant="success">Going</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
