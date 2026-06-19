import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../../test/renderWithProviders";
import { EventDetailPage } from "./EventDetailPage";
import type { EventItem, Member } from "../../data";

const aaron: Member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "a@b.c",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null, homeAddress: null,
  location: null,
};

const makeEvent = (over: Partial<EventItem>): EventItem => ({
  id: "e1",
  scope: "inner",
  groupId: "ic4",
  title: "Inner Circle event",
  date: "2026-07-04",
  startTime: "16:00",
  endTime: "19:00",
  hostId: "aaron",
  creatorId: "aaron",
  address: null,
  guideUrl: null,
  type: "meeting",
  ...over,
});

const events = [makeEvent({ id: "e1", title: "Inner Circle event" })];

vi.mock("../../data/hooks", () => ({
  useCurrentMemberId: () => ({ data: "aaron" }),
  useEvents: () => ({ data: events, isLoading: false }),
  useMembers: () => ({ data: [aaron], isLoading: false }),
  useMember: () => ({ data: aaron }),
  useRsvps: () => ({ data: [] }),
  useSetRsvp: () => ({ mutate: vi.fn() }),
}));

function renderAt(path: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/innercircle/event/:id" element={<EventDetailPage />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe("EventDetailPage", () => {
  it("renders the event title for a known id", async () => {
    renderAt("/innercircle/event/e1");
    await waitFor(() => {
      expect(screen.getByText("Inner Circle event")).toBeInTheDocument();
    });
  });

  it("shows a not-found state for an unknown id", async () => {
    renderAt("/innercircle/event/does-not-exist");
    await waitFor(() => {
      expect(screen.getByText("Event not found.")).toBeInTheDocument();
    });
  });
});
