import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "./EventCard";
import type { EventItem, Member } from "../data";
import type { EventAttendee } from "./EventCard";

const event: EventItem = {
  id: "e1",
  scope: "inner",
  groupId: "ic4",
  title: "Inner Circle meeting",
  date: "2026-07-04",
  startTime: "16:00",
  endTime: "19:00",
  hostId: "aaron",
  creatorId: "aaron",
  address: "kiefholzstraße 26, 12435 Berlin",
  guideUrl: "https://example.com/guide",
  type: "meeting",
};

const aaron: Member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "a@b.c",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  location: null,
};

const cemre: Member = {
  id: "cemre",
  name: "Cemre Nur",
  email: "cemre@example.com",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  location: null,
};

const vki: Member = {
  id: "vki",
  name: "Vki",
  email: "vki@example.com",
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  location: null,
};

describe("EventCard", () => {
  it("shows title and formatted when", () => {
    render(
      <EventCard event={event} host={aaron} currentMemberId="aaron" going={5} total={7} defaultOpen />,
    );
    expect(screen.getByText("Inner Circle meeting")).toBeInTheDocument();
    expect(screen.getAllByText(/Sat 4 July · 16:00-19:00/).length).toBeGreaterThan(0);
  });

  it("renders the title as small body text, not a large serif heading", () => {
    render(
      <EventCard event={event} host={aaron} currentMemberId="aaron" going={6} total={8} defaultOpen />,
    );
    // Title must NOT be a heading element (it is the accordion summary).
    expect(
      screen.queryByRole("heading", { name: "Inner Circle meeting" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Inner Circle meeting")).toBeInTheDocument();
  });

  it("shows attendance count in green-styled success text", () => {
    render(
      <EventCard event={event} host={aaron} currentMemberId="aaron" going={6} total={8} defaultOpen />,
    );
    expect(screen.getByText("6 of 8 going")).toBeInTheDocument();
  });

  it("opens the propose-hosting-swap modal and sends a swap", async () => {
    const onSwap = vi.fn();
    render(
      <EventCard
        event={event}
        host={aaron}
        currentMemberId="aaron"
        going={6}
        total={8}
        defaultOpen
        monthLabel="July 2026"
        swapTargets={[
          { id: "meeting-1", label: "August 2026 · hosted by David", hostName: "David" },
        ]}
        onProposeSwap={onSwap}
      />,
    );
    expect(screen.getByText("You're the host")).toBeInTheDocument();

    // No dialog before clicking.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /propose hosting swap/i }));

    const dialog = screen.getByRole("dialog", { name: /propose hosting swap/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("July 2026")).toBeInTheDocument();

    // Send is disabled until a target is chosen.
    const send = screen.getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "meeting-1",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSwap).toHaveBeenCalledWith({ targetEventId: "meeting-1", message: "" });
  });

  it("shows another member as host without swap action", () => {
    const other = { ...aaron, id: "david", name: "David" };
    render(
      <EventCard
        event={event}
        host={other}
        currentMemberId="aaron"
        going={3}
        total={7}
        defaultOpen
      />,
    );
    expect(screen.getByText("David")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /propose hosting swap/i })).not.toBeInTheDocument();
  });

  describe("calendar RSVP toggle", () => {
    it("shows 'You're going' and offers a can't-make-it toggle", async () => {
      const onRsvp = vi.fn();
      const other = { ...aaron, id: "david", name: "David" };
      render(
        <EventCard
          event={event}
          host={other}
          currentMemberId="aaron"
          going={6}
          total={8}
          attendees={[{ member: aaron, status: "going" }]}
          onRsvp={onRsvp}
        />,
      );
      expect(screen.getByText("You're going")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /^RSVP/i }));
      await userEvent.click(screen.getByRole("button", { name: /can't make it/i }));
      expect(onRsvp).toHaveBeenCalledWith("declined", null);
    });

    it("lets a not-going member toggle back to going", async () => {
      const onRsvp = vi.fn();
      const other = { ...aaron, id: "david", name: "David" };
      render(
        <EventCard
          event={event}
          host={other}
          currentMemberId="aaron"
          going={5}
          total={8}
          attendees={[{ member: aaron, status: "declined", note: "Away" }]}
          onRsvp={onRsvp}
        />,
      );
      expect(screen.getByText("You're not going")).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /^RSVP/i }));
      await userEvent.click(screen.getByRole("button", { name: /make it after all/i }));
      expect(onRsvp).toHaveBeenCalledWith("going", null);
    });
  });

  describe("attendance list", () => {
    const attendees: EventAttendee[] = [
      { member: aaron, status: "going" },
      { member: cemre, status: "declined", note: "Unfortunately I booked a weekend event in advance." },
      { member: vki, status: "declined", note: "In Asia that week." },
    ];

    it("renders declined members in the attendance accordion", () => {
      render(
        <EventCard
          event={event}
          host={aaron}
          currentMemberId="aaron"
          going={5}
          total={7}
          attendees={attendees}
          defaultOpen
        />,
      );
      expect(screen.getByText("Cemre Nur")).toBeInTheDocument();
      expect(screen.getByText("Vki")).toBeInTheDocument();
    });

    it("shows 'can't make it' label for declined members", () => {
      render(
        <EventCard
          event={event}
          host={aaron}
          currentMemberId="aaron"
          going={5}
          total={7}
          attendees={attendees}
          defaultOpen
        />,
      );
      const labels = screen.getAllByText("can't make it");
      expect(labels.length).toBe(2);
    });

    it("shows decline reason notes", () => {
      render(
        <EventCard
          event={event}
          host={aaron}
          currentMemberId="aaron"
          going={5}
          total={7}
          attendees={attendees}
          defaultOpen
        />,
      );
      expect(screen.getByText(/In Asia that week/)).toBeInTheDocument();
    });

    it("does not render going members in the non-going list", () => {
      render(
        <EventCard
          event={event}
          host={aaron}
          currentMemberId="aaron"
          going={5}
          total={7}
          attendees={attendees}
          defaultOpen
        />,
      );
      // Aaron is going — the attendee list should not contain an "Aaron Blum" list item
      const list = screen.queryByRole("list", { name: /members not going/i });
      if (list) {
        expect(list.textContent).not.toContain("Aaron Blum");
      }
    });

    it("shows 'maybe' label for maybe-status members", () => {
      const withMaybe: EventAttendee[] = [
        { member: vki, status: "maybe", note: "Not sure yet." },
      ];
      render(
        <EventCard
          event={event}
          host={aaron}
          currentMemberId="david"
          going={5}
          total={7}
          attendees={withMaybe}
          defaultOpen
        />,
      );
      expect(screen.getByText("maybe")).toBeInTheDocument();
    });
  });
});
