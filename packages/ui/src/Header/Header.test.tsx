import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Header } from "./Header";

describe("Header", () => {
  it("renders eyebrow, title and description", () => {
    render(<Header eyebrow="Community" title="The Loop" description="Ask for help." />);
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The Loop" })).toBeInTheDocument();
    expect(screen.getByText("Ask for help.")).toBeInTheDocument();
  });

  it("renders without optional props", () => {
    render(<Header title="Everyone in the Circle" />);
    expect(screen.getByRole("heading", { name: "Everyone in the Circle" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Header eyebrow="Directory" title="Everyone" description="Browse." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
