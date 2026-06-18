import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { NotificationItem } from "./NotificationItem";
import type { Activity, Member } from "../data/types";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

const members: Member[] = [
  makeMember("david", "David"),
  makeMember("aaron", "Aaron Blum"),
  makeMember("vki", "Vki"),
];

function makeMember(id: string, name: string): Member {
  return {
    id,
    name,
    email: `${id}@example.com`,
    photoUrl: null,
    from: null,
    bio: null,
    interests: [],
    dietary: null,
    whatsappUrl: null,
    location: null,
  };
}

function makeActivity(over: Partial<Activity>): Activity {
  return {
    id: "a1",
    type: "wall_post",
    scope: "analog",
    actorId: "david",
    subjectId: "vki",
    targetRoute: "/innercircle/members/vki",
    createdAt: new Date().toISOString(),
    readBy: [],
    ...over,
  };
}

function renderItem(activity: Activity, currentMemberId = "aaron", onRead = vi.fn()) {
  return render(
    <MemoryRouter>
      <NotificationItem
        activity={activity}
        members={members}
        currentMemberId={currentMemberId}
        onRead={onRead}
      />
    </MemoryRouter>,
  );
}

describe("NotificationItem text per type", () => {
  it("wall_post on another member's wall", () => {
    renderItem(makeActivity({ type: "wall_post", actorId: "david", subjectId: "vki" }));
    expect(screen.getByText("David wrote on Vki’s wall")).toBeInTheDocument();
  });

  it("wall_post on your own wall", () => {
    renderItem(makeActivity({ type: "wall_post", actorId: "david", subjectId: "aaron" }));
    expect(screen.getByText("David wrote on your wall")).toBeInTheDocument();
  });

  it("event_created", () => {
    renderItem(makeActivity({ type: "event_created", actorId: "david", subjectId: null }));
    expect(screen.getByText("David created a meeting")).toBeInTheDocument();
  });

  it("member_joined inner", () => {
    renderItem(
      makeActivity({ type: "member_joined", actorId: "vki", subjectId: null, scope: "inner" }),
    );
    expect(screen.getByText("Vki joined the Inner Circle")).toBeInTheDocument();
  });

  it("member_joined analog", () => {
    renderItem(
      makeActivity({ type: "member_joined", actorId: "vki", subjectId: null, scope: "analog" }),
    );
    expect(screen.getByText("Vki joined the Analog Circle")).toBeInTheDocument();
  });

  it("loop_post", () => {
    renderItem(makeActivity({ type: "loop_post", actorId: "david", subjectId: null }));
    expect(screen.getByText("David posted to The Loop")).toBeInTheDocument();
  });
});

describe("NotificationItem unread dot", () => {
  it("shows an unread indicator when not read by current member", () => {
    renderItem(makeActivity({ readBy: [] }));
    expect(screen.getByLabelText("Unread")).toBeInTheDocument();
  });

  it("hides the unread indicator when read by current member", () => {
    renderItem(makeActivity({ readBy: ["aaron"] }));
    expect(screen.queryByLabelText("Unread")).not.toBeInTheDocument();
  });
});

describe("NotificationItem click", () => {
  it("navigates to the target route and calls onRead", async () => {
    navigateMock.mockClear();
    const onRead = vi.fn();
    renderItem(makeActivity({ targetRoute: "/innercircle/the-loop" }), "aaron", onRead);
    await userEvent.click(screen.getByRole("button"));
    expect(navigateMock).toHaveBeenCalledWith("/innercircle/the-loop");
    expect(onRead).toHaveBeenCalledOnce();
  });
});
