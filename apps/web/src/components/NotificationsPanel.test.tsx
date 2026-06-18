import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@analog/ui";
import { NotificationsPanel } from "./NotificationsPanel";
import type { Activity, Member } from "../data/types";

const markReadMutate = vi.fn();
const markAllMutate = vi.fn();

vi.mock("../data/hooks", () => ({
  useMarkActivityRead: () => ({ mutate: markReadMutate }),
  useMarkAllActivityRead: () => ({ mutate: markAllMutate }),
}));

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

const members: Member[] = [
  makeMember("david", "David"),
  makeMember("aaron", "Aaron Blum"),
  makeMember("odette", "Odette"),
];

const activities: Activity[] = [
  {
    id: "a-analog",
    type: "loop_post",
    scope: "analog",
    actorId: "david",
    subjectId: null,
    targetRoute: "/innercircle/the-loop",
    createdAt: "2026-06-17T00:00:00Z",
    readBy: [],
  },
  {
    id: "a-inner",
    type: "event_created",
    scope: "inner",
    actorId: "odette",
    subjectId: null,
    targetRoute: "/innercircle/group/ic4",
    createdAt: "2026-06-16T00:00:00Z",
    readBy: [],
  },
  {
    id: "a-yours",
    type: "wall_post",
    scope: "analog",
    actorId: "david",
    subjectId: "aaron",
    targetRoute: "/innercircle/members/aaron",
    createdAt: "2026-06-15T00:00:00Z",
    readBy: [],
  },
];

function renderPanel() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <NotificationsPanel
          activities={activities}
          members={members}
          currentMemberId="aaron"
        />
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  markReadMutate.mockClear();
  markAllMutate.mockClear();
});

describe("NotificationsPanel tab filter", () => {
  it("shows analog-scope activity on the default Analog Circle tab", () => {
    renderPanel();
    expect(screen.getByText("David posted to The Loop")).toBeInTheDocument();
    expect(screen.getByText("David wrote on your wall")).toBeInTheDocument();
    expect(screen.queryByText("Odette created a meeting")).not.toBeInTheDocument();
  });

  it("shows inner-scope activity on the Inner Circle tab", async () => {
    renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Inner Circle" }));
    expect(screen.getByText("Odette created a meeting")).toBeInTheDocument();
    expect(screen.queryByText("David posted to The Loop")).not.toBeInTheDocument();
  });

  it("shows only activity about the current member on the Yourself tab", async () => {
    renderPanel();
    await userEvent.click(screen.getByRole("button", { name: "Yourself" }));
    expect(screen.getByText("David wrote on your wall")).toBeInTheDocument();
    expect(screen.queryByText("David posted to The Loop")).not.toBeInTheDocument();
    expect(screen.queryByText("Odette created a meeting")).not.toBeInTheDocument();
  });

  it("shows an empty state when a tab has no activity", async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <NotificationsPanel activities={[]} members={members} currentMemberId="aaron" />
        </ToastProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText("Nothing here yet.")).toBeInTheDocument();
  });
});

describe("NotificationsPanel mark all read", () => {
  it("calls markAll with the current member id", async () => {
    renderPanel();
    await userEvent.click(screen.getByRole("button", { name: /mark all read/i }));
    expect(markAllMutate).toHaveBeenCalledWith("aaron", expect.any(Object));
  });
});
