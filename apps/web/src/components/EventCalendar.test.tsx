import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test/renderWithProviders";
import { EventCalendar } from "./EventCalendar";
import type { EventItem, Member, Group } from "../data";

// EventCalendar reads from the data hooks; mock them so the test is deterministic
// and independent of the configured backend.
const innerGroup: Group = { id: "ic4", type: "inner", name: "ic4", parentId: "analog-root" };

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
  id: "e",
  scope: "inner",
  groupId: "ic4",
  title: "Inner Circle meeting",
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

// 2 inner events + 2 analog events.
const innerEvents = [
  makeEvent({ id: "m0", date: "2026-07-04" }),
  makeEvent({ id: "m1", date: "2026-08-01" }),
];
const analogEvents = [
  makeEvent({
    id: "a0",
    scope: "analog",
    groupId: "analog-root",
    title: "Analog Circle mixer",
    date: "2026-07-18",
  }),
  makeEvent({
    id: "a1",
    scope: "analog",
    groupId: "analog-root",
    title: "Summer picnic",
    date: "2026-08-15",
  }),
];
const allEvents = [...innerEvents, ...analogEvents];

vi.mock("../data/hooks", () => ({
  useCurrentMemberId: () => ({ data: "aaron" }),
  useInnerGroup: () => ({ data: innerGroup }),
  useMembers: () => ({ data: [aaron], isLoading: false }),
  useEvents: () => ({ data: allEvents, isLoading: false }),
  useRsvps: () => ({ data: [] }),
  useSetRsvp: () => ({ mutate: vi.fn() }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EventCalendar", () => {
  describe("list view (scope filter → counts)", () => {
    it("inner scope shows only inner-group events", async () => {
      renderWithProviders(<EventCalendar scope="inner" view="list" groupId="ic4" />);
      await waitFor(() => {
        expect(screen.getAllByText("EVENT").length).toBe(innerEvents.length);
      });
      // Analog-only events are excluded under the inner scope. EventCard's
      // calendar variant renders the date line, e.g. "Sat 18 July".
      expect(screen.queryByText(/18 July/)).not.toBeInTheDocument();
    });

    it("analog scope shows all events (inner + community)", async () => {
      renderWithProviders(<EventCalendar scope="analog" view="list" />);
      await waitFor(() => {
        expect(screen.getAllByText("EVENT").length).toBe(allEvents.length);
      });
      // Community event dates appear under analog scope.
      expect(screen.getAllByText(/18 July/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/15 August/).length).toBeGreaterThan(0);
    });

    it("does not show an inline New event button (create is modal-driven from the page)", async () => {
      renderWithProviders(
        <EventCalendar scope="inner" view="list" groupId="ic4" onCreate={() => {}} />,
      );
      await waitFor(() => {
        expect(screen.getAllByText("EVENT").length).toBe(innerEvents.length);
      });
      expect(screen.queryByRole("button", { name: /new event/i })).not.toBeInTheDocument();
    });
  });

  describe("grid view (list vs grid)", () => {
    it("month view renders the calendar grid, not the EventCard list", async () => {
      const { container } = renderWithProviders(
        <EventCalendar scope="analog" view="month" />,
      );
      await waitFor(() => {
        expect(container.querySelector(".rbc-calendar")).toBeInTheDocument();
      });
      // Grid (month) is rendered, and the custom toolbar shows navigation
      // (not the duplicate Month/Week view switcher the app already owns).
      expect(container.querySelector(".rbc-month-view")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /today/i })).toBeInTheDocument();
      // The list-only "EVENT" badge must not appear in grid mode.
      expect(screen.queryByText("EVENT")).not.toBeInTheDocument();
    });
  });
});
