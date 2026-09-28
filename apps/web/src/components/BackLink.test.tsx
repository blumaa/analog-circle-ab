import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/renderWithProviders";
import { BackLink } from "./BackLink";

describe("BackLink", () => {
  it("is an arrow with an accessible name and no visible text", () => {
    renderWithProviders(<BackLink fallback="/circles" />);
    const link = screen.getByRole("link", { name: "Back" });
    expect(link).toHaveAttribute("href", "/circles");
    expect(link).toHaveTextContent("");
  });
});
