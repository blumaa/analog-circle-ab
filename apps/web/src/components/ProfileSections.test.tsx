import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileSections } from "./ProfileSections";
import type { Member } from "../data";

const base: Member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "aaron@example.com",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  homeAddress: null,
  location: null,
};

describe("ProfileSections", () => {
  it("renders From field when from is set", () => {
    render(<ProfileSections member={{ ...base, from: "United States" }} />);
    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("omits From field when from is null", () => {
    render(<ProfileSections member={base} />);
    expect(screen.queryByText(/from/i)).not.toBeInTheDocument();
  });

  it("renders Home Address field when homeAddress is set", () => {
    render(
      <ProfileSections member={{ ...base, homeAddress: "kiefholzstraße 26, 12435 Berlin" }} />,
    );
    expect(screen.getByText("kiefholzstraße 26, 12435 Berlin")).toBeInTheDocument();
  });

  it("omits Home Address field when homeAddress is null", () => {
    render(<ProfileSections member={base} />);
    expect(screen.queryByText(/home address/i)).not.toBeInTheDocument();
  });

  it("renders interests as non-interactive chips", () => {
    render(
      <ProfileSections member={{ ...base, interests: ["Hiking", "Padel", "Poetry"] }} />,
    );
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.getByText("Padel")).toBeInTheDocument();
    expect(screen.getByText("Poetry")).toBeInTheDocument();
    // Static chips must not be buttons
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("omits interests section when interests is empty", () => {
    render(<ProfileSections member={base} />);
    expect(screen.queryByText(/interests/i)).not.toBeInTheDocument();
  });

  it("renders dietary field when set", () => {
    render(<ProfileSections member={{ ...base, dietary: "Vegetarian" }} />);
    expect(screen.getByText("Vegetarian")).toBeInTheDocument();
  });

});

