import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { TypeTag } from "./TypeTag";

describe("TypeTag", () => {
  it("renders its text", () => {
    render(<TypeTag>Event · My Circle</TypeTag>);
    expect(screen.getByText("Event · My Circle")).toBeInTheDocument();
  });

  it("defaults to gold tone", () => {
    render(<TypeTag>Event</TypeTag>);
    expect(screen.getByText("Event")).toHaveAttribute("data-tone", "gold");
  });

  it("applies tone", () => {
    render(<TypeTag tone="pink">Birthday</TypeTag>);
    expect(screen.getByText("Birthday")).toHaveAttribute("data-tone", "pink");
  });

  it("exposes the full text as a tooltip, since long tags truncate", () => {
    render(<TypeTag>Need · Kreuzberg, Neukölln & Tempelhof</TypeTag>);
    expect(screen.getByText("Need · Kreuzberg, Neukölln & Tempelhof")).toHaveAttribute(
      "title",
      "Need · Kreuzberg, Neukölln & Tempelhof",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TypeTag tone="green">Offer</TypeTag>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
