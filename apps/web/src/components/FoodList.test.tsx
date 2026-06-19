import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { FoodList } from "./FoodList";
import { renderWithProviders } from "../test/renderWithProviders";
import type { Member } from "../data";

const base: Member = {
  id: "1",
  name: "Alice Doe",
  email: "alice@example.com",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  homeAddress: null,
  location: null,
};

const members: Member[] = [
  { ...base, id: "1", name: "Alice Doe", dietary: "Vegan, no nuts" },
  { ...base, id: "2", name: "Bob Smith", dietary: null },
];

describe("FoodList", () => {
  it("renders the intro paragraph", () => {
    renderWithProviders(<FoodList members={members} />);
    expect(screen.getByText(/allergies and dietary notes/i)).toBeInTheDocument();
  });

  it("renders member names uppercased via CSS (name text is present)", () => {
    renderWithProviders(<FoodList members={members} />);
    expect(screen.getByText("Alice Doe")).toBeInTheDocument();
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
  });

  it("renders dietary note when present", () => {
    renderWithProviders(<FoodList members={members} />);
    expect(screen.getByText("Vegan, no nuts")).toBeInTheDocument();
  });

  it("renders '-' when dietary is null", () => {
    renderWithProviders(<FoodList members={members} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders each member as a list item card", () => {
    const { container } = renderWithProviders(<FoodList members={members} />);
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
  });
});
