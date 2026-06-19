import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../test/renderWithProviders";

// ---- hook mocks ----
const mockCurrentMemberId = vi.fn();
const mockWallPosts = vi.fn();
const mockMembers = vi.fn();
const mockActivity = vi.fn();
const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockToggleLikeMutate = vi.fn();
const mockAddReplyMutate = vi.fn();
const mockInnerGroup = vi.fn();

vi.mock("../data/hooks", () => ({
  useCurrentMemberId: () => mockCurrentMemberId(),
  useWallPosts: () => mockWallPosts(),
  useMembers: () => mockMembers(),
  useActivity: () => mockActivity(),
  useCreateWallPost: () => ({ mutate: mockCreateMutate }),
  useDeleteWallPost: () => ({ mutate: mockDeleteMutate }),
  useToggleWallPostLike: () => ({ mutate: mockToggleLikeMutate }),
  useAddWallPostReply: () => ({ mutate: mockAddReplyMutate }),
  useInnerGroup: () => mockInnerGroup(),
}));

import { ProfileWall } from "./ProfileWall";

const ownerId = "aaron";
const authorId = "aaron";

const members = [
  { id: "aaron", name: "Aaron Blum", email: "", photoUrl: null, from: null, bio: null, interests: [], dietary: null, whatsappUrl: null, homeAddress: null, location: null },
  { id: "david", name: "David", email: "", photoUrl: null, from: null, bio: null, interests: [], dietary: null, whatsappUrl: null, homeAddress: null, location: null },
];

const wallPosts = [
  { id: "p1", ownerId: "aaron", authorId: "aaron", scope: "analog" as const, body: "Hello wall", imageUrl: null, createdAt: "2026-06-01T12:00:00Z", likedBy: ["david"], replies: [{ id: "r1", authorId: "david", body: "Nice one", createdAt: "2026-06-01T13:00:00Z" }] },
  { id: "p2", ownerId: "aaron", authorId: "david", scope: "inner" as const, body: "Inner post", imageUrl: null, createdAt: "2026-06-02T12:00:00Z", likedBy: [], replies: [] },
];

// Activity feed: an analog activity about the owner, plus an inner activity.
const activity = [
  { id: "a1", type: "wall_post" as const, scope: "analog" as const, actorId: "david", subjectId: "aaron", targetRoute: "/m/aaron", createdAt: "2026-06-03T12:00:00Z", readBy: [] },
  { id: "a2", type: "member_joined" as const, scope: "inner" as const, actorId: "david", subjectId: null, targetRoute: "/", createdAt: "2026-06-04T12:00:00Z", readBy: [] },
  { id: "a3", type: "event_created" as const, scope: "analog" as const, actorId: "aaron", subjectId: null, targetRoute: "/events", createdAt: "2026-06-05T12:00:00Z", readBy: [] },
];

beforeEach(() => {
  mockCurrentMemberId.mockReturnValue({ data: authorId });
  mockWallPosts.mockReturnValue({ data: wallPosts });
  mockMembers.mockReturnValue({ data: members });
  mockActivity.mockReturnValue({ data: activity });
  mockInnerGroup.mockReturnValue({ data: null });
  mockCreateMutate.mockClear();
  mockDeleteMutate.mockClear();
  mockToggleLikeMutate.mockClear();
  mockAddReplyMutate.mockClear();
});

// "personal" is the default tab: wall posts on this wall + activity about the owner.
// p1 (analog) is shown; p2 (inner) is hidden for a viewer with no shared inner circle
// (aaron is the owner so he sees both); a1 (subjectId === aaron) is shown.

describe("ProfileWall", () => {
  it("renders Wall heading", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Wall")).toBeInTheDocument();
  });

  it("renders wall posts with author names (default Personal tab)", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Hello wall")).toBeInTheDocument();
    expect(screen.getByText("Inner post")).toBeInTheDocument();
    expect(screen.getAllByText("Aaron Blum").length).toBeGreaterThan(0);
  });

  it("renders activity items about the owner through a card", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // a1: david wrote on aaron's wall — aaron is the viewer so it reads "your wall"
    expect(screen.getByText("David wrote on your wall")).toBeInTheDocument();
  });

  it("shows delete button only on wall posts the viewer may delete", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // aaron owns the wall → can delete both wall posts; activity cards have no delete.
    expect(screen.getAllByRole("button", { name: /delete post/i }).length).toBe(2);
  });

  it("hides delete button for non-owner, non-author", () => {
    mockCurrentMemberId.mockReturnValue({ data: "david" });
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // david sees only the analog post p1 (by aaron) — cannot delete it.
    expect(screen.queryByRole("button", { name: /delete post/i })).not.toBeInTheDocument();
  });

  it("renders composer for signed-in member", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByRole("textbox", { name: /post body/i })).toBeInTheDocument();
  });

  it("submits a new post via composer", async () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    const textarea = screen.getByRole("textbox", { name: /post body/i });
    await userEvent.type(textarea, "My new post");
    await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
    expect(mockCreateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ body: "My new post", ownerId, authorId }),
      expect.any(Object),
    );
  });

  it("calls deletePost when delete is clicked", async () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    const [firstDelete] = screen.getAllByRole("button", { name: /delete post/i });
    await userEvent.click(firstDelete!);
    expect(mockDeleteMutate).toHaveBeenCalledOnce();
  });

  it("shows Inner badge for inner-scoped items", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getAllByText("Inner").length).toBeGreaterThan(0);
  });

  it("hides inner items from a viewer outside the owner's inner circle", () => {
    mockCurrentMemberId.mockReturnValue({ data: "david" });
    mockInnerGroup.mockReturnValue({ data: null });
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Hello wall")).toBeInTheDocument();
    expect(screen.queryByText("Inner post")).not.toBeInTheDocument();
  });

  it("renders a like control on each visible wall post with the count", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // Two wall posts in Personal view; activity cards have no like control.
    const likeButtons = screen.getAllByRole("button", { name: /^(Like|Unlike)$/ });
    expect(likeButtons.length).toBe(2);
  });

  it("toggles a like via useToggleWallPostLike", async () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    const [firstLike] = screen.getAllByRole("button", { name: /^(Like|Unlike)$/ });
    await userEvent.click(firstLike!);
    expect(mockToggleLikeMutate).toHaveBeenCalledWith(
      expect.objectContaining({ memberId: authorId }),
      expect.any(Object),
    );
  });

  it("submits a reply via useAddWallPostReply", async () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // p1 has a reply composer (current member present). Find its Reply body textarea.
    const [replyBox] = screen.getAllByRole("textbox", { name: /reply body/i });
    await userEvent.type(replyBox!, "Thanks!");
    const replyButtons = screen.getAllByRole("button", { name: /^Reply$/ });
    await userEvent.click(replyButtons[0]!);
    expect(mockAddReplyMutate).toHaveBeenCalledWith(
      expect.objectContaining({ authorId, body: "Thanks!" }),
      expect.any(Object),
    );
  });

  describe("filter tabs", () => {
    it("Analog Circle tab shows only analog-scoped items", async () => {
      renderWithProviders(<ProfileWall ownerId={ownerId} />);
      await userEvent.click(screen.getByRole("button", { name: "Analog Circle" }));
      expect(screen.getByText("Hello wall")).toBeInTheDocument(); // p1 analog
      expect(screen.queryByText("Inner post")).not.toBeInTheDocument(); // p2 inner
      expect(screen.getByText("David wrote on your wall")).toBeInTheDocument(); // a1 analog
      expect(screen.getByText("Aaron Blum created an event")).toBeInTheDocument(); // a3 analog
    });

    it("Inner Circle tab shows only inner-scoped items", async () => {
      renderWithProviders(<ProfileWall ownerId={ownerId} />);
      await userEvent.click(screen.getByRole("button", { name: "Inner Circle" }));
      expect(screen.getByText("Inner post")).toBeInTheDocument(); // p2 inner
      expect(screen.queryByText("Hello wall")).not.toBeInTheDocument(); // p1 analog
      expect(screen.getByText("David joined the Inner Circle")).toBeInTheDocument(); // a2 inner
    });

    it("Personal tab (default) shows wall posts and activity about the owner", () => {
      renderWithProviders(<ProfileWall ownerId={ownerId} />);
      expect(screen.getByText("Hello wall")).toBeInTheDocument();
      expect(screen.getByText("David wrote on your wall")).toBeInTheDocument(); // subject = aaron
      // a3 (event_created, subjectId null) is NOT about the owner → hidden in Personal.
      expect(screen.queryByText("Aaron Blum created an event")).not.toBeInTheDocument();
    });
  });

  it("has no axe violations", async () => {
    const { container } = renderWithProviders(<ProfileWall ownerId={ownerId} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
