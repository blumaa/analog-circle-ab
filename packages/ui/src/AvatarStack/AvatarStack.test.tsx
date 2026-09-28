import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AvatarStack } from "./AvatarStack";

const people = ["Ada", "Cem", "Eli", "Bea", "Lu"].map((name) => ({ name }));

describe("AvatarStack", () => {
  it("renders every avatar under the max", () => {
    render(<AvatarStack people={people} />);
    expect(screen.getAllByRole("img")).toHaveLength(5);
  });

  it("caps at max and shows overflow", () => {
    render(<AvatarStack people={people} max={3} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("is labelled as a group", () => {
    render(<AvatarStack people={people} label="Going" />);
    expect(screen.getByRole("group", { name: "Going" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AvatarStack people={people} max={3} label="Going" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
