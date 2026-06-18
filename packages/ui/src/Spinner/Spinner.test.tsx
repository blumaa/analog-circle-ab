import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("has role=status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has default accessible label 'Loading'", () => {
    render(<Spinner />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  });

  it("accepts a custom label", () => {
    render(<Spinner label="Saving changes" />);
    expect(screen.getByRole("status", { name: "Saving changes" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Spinner />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with custom label", async () => {
    const { container } = render(<Spinner label="Saving changes" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
