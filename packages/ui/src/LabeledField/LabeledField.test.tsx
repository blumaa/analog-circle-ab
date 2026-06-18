import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { LabeledField } from "./LabeledField";

describe("LabeledField", () => {
  it("renders the label and children", () => {
    render(<LabeledField label="From">United States</LabeledField>);
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("renders complex children", () => {
    render(
      <LabeledField label="Interests">
        <span>Design</span>
        <span>Hiking</span>
      </LabeledField>,
    );
    expect(screen.getByText("Interests")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <LabeledField label="Bio">A curious person who loves coffee.</LabeledField>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
