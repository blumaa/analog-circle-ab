import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";

const mockCurrentMemberId = vi.fn();
const mockMember = vi.fn();
const mockInnerGroup = vi.fn();
const mockEvents = vi.fn();
const mockMembers = vi.fn();
const mockRsvps = vi.fn();

vi.mock("../../data/hooks", () => ({
  useCurrentMemberId: () => mockCurrentMemberId(),
  useMember: () => mockMember(),
  useInnerGroup: () => mockInnerGroup(),
  useEvents: () => mockEvents(),
  useMembers: () => mockMembers(),
  useRsvps: () => mockRsvps(),
}));

import { DashboardPage } from "./DashboardPage";

const member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "aaron@test.com",
  photoUrl: null,
  from: "NYC",
  bio: "Test bio",
  interests: ["hiking"],
  dietary: null,
  whatsappUrl: null,
  homeAddress: null,
  location: null,
};

beforeEach(() => {
  mockCurrentMemberId.mockReturnValue({ data: "aaron" });
  mockMember.mockReturnValue({ data: member });
  mockInnerGroup.mockReturnValue({ data: null });
  mockEvents.mockReturnValue({ data: [] });
  mockMembers.mockReturnValue({ data: [member] });
  mockRsvps.mockReturnValue({ data: [] });
});

describe("DashboardPage", () => {
  it("renders the welcome greeting", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it("renders 'Community' section heading in sentence case (not all-caps)", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText("Community")).toBeInTheDocument();
    // Must NOT render the old all-caps string
    expect(screen.queryByText("COMMUNITY")).not.toBeInTheDocument();
  });

  it("does not render the old all-caps 'COMING UP' heading", () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.queryByText("COMING UP")).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithProviders(<DashboardPage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
