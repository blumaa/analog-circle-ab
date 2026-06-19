import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { MemberCard } from "./MemberCard";
import { renderWithProviders } from "../test/renderWithProviders";
import type { Member } from "../data";

const member: Member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "aaron@example.com",
  photoUrl: null,
  from: "united states",
  bio: "Curious coder.",
  interests: ["Design", "Hiking"],
  dietary: null,
  whatsappUrl: "https://wa.me/000",
  homeAddress: null,
  location: null,
};

describe("MemberCard", () => {
  it("renders member name", () => {
    renderWithProviders(<MemberCard member={member} />);
    expect(screen.getByText("Aaron Blum")).toBeInTheDocument();
  });

  it("renders WhatsApp button linking to whatsappUrl", () => {
    renderWithProviders(<MemberCard member={member} />);
    const link = screen.getByRole("link", { name: /whatsapp aaron/i });
    expect(link).toHaveAttribute("href", "https://wa.me/000");
  });

  it("links to the member's profile page via name link", () => {
    renderWithProviders(<MemberCard member={member} />);
    const link = screen.getByRole("link", { name: /^aaron blum$/i });
    expect(link).toHaveAttribute("href", "/innercircle/members/aaron");
  });

  it("renders avatar initials fallback when photoUrl is null", () => {
    renderWithProviders(<MemberCard member={member} />);
    expect(screen.getByRole("img", { name: "Aaron Blum" })).toBeInTheDocument();
  });

  it("omits WhatsApp button when whatsappUrl is null", () => {
    renderWithProviders(<MemberCard member={{ ...member, whatsappUrl: null }} />);
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument();
  });

  it("renders as an article element (card layout)", () => {
    const { container } = renderWithProviders(<MemberCard member={member} />);
    expect(container.querySelector("article")).toBeInTheDocument();
  });

  it("renders More info button", () => {
    renderWithProviders(<MemberCard member={member} />);
    expect(screen.getByText("More info")).toBeInTheDocument();
  });
});
