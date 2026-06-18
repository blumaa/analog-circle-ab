import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";

// ---- hook mocks ----
const mockCurrentMemberId = vi.fn();
const mockWallPosts = vi.fn();
const mockMembers = vi.fn();
const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockInnerGroup = vi.fn();

vi.mock("../data/hooks", () => ({
  useCurrentMemberId: () => mockCurrentMemberId(),
  useWallPosts: () => mockWallPosts(),
  useMembers: () => mockMembers(),
  useCreateWallPost: () => ({ mutate: mockCreateMutate }),
  useDeleteWallPost: () => ({ mutate: mockDeleteMutate }),
  useInnerGroup: () => mockInnerGroup(),
}));

import { ProfileWall } from "./ProfileWall";

const ownerId = "aaron";
const authorId = "aaron";

const members = [
  { id: "aaron", name: "Aaron Blum", email: "", photoUrl: null, from: null, bio: null, interests: [], dietary: null, whatsappUrl: null, location: null },
  { id: "david", name: "David", email: "", photoUrl: null, from: null, bio: null, interests: [], dietary: null, whatsappUrl: null, location: null },
];

const wallPosts = [
  { id: "p1", ownerId: "aaron", authorId: "aaron", scope: "analog" as const, body: "Hello wall", imageUrl: null, createdAt: "2026-06-01T12:00:00Z" },
  { id: "p2", ownerId: "aaron", authorId: "david", scope: "inner" as const, body: "Inner post", imageUrl: null, createdAt: "2026-06-02T12:00:00Z" },
];

beforeEach(() => {
  mockCurrentMemberId.mockReturnValue({ data: authorId });
  mockWallPosts.mockReturnValue({ data: wallPosts });
  mockMembers.mockReturnValue({ data: members });
  mockInnerGroup.mockReturnValue({ data: null });
  mockCreateMutate.mockClear();
  mockDeleteMutate.mockClear();
});

describe("ProfileWall", () => {
  it("renders Wall heading", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Wall")).toBeInTheDocument();
  });

  it("renders posts with author names", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Hello wall")).toBeInTheDocument();
    expect(screen.getByText("Inner post")).toBeInTheDocument();
    expect(screen.getAllByText("Aaron Blum").length).toBeGreaterThan(0);
    expect(screen.getByText("David")).toBeInTheDocument();
  });

  it("shows delete button for own post (author)", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    // "Hello wall" was posted by aaron who is also currentMember - should see delete
    const deleteButtons = screen.getAllByRole("button", { name: /delete post/i });
    // aaron owns the wall and is the author of p1, and is owner so can delete p2 too
    expect(deleteButtons.length).toBe(2);
  });

  it("shows delete button for wall owner on others' posts", () => {
    // aaron is wall owner and currentMember — can delete david's post too
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getAllByRole("button", { name: /delete post/i }).length).toBe(2);
  });

  it("hides delete button for non-owner, non-author", () => {
    mockCurrentMemberId.mockReturnValue({ data: "david" });
    // david is not wall owner (aaron is) and has no inner circle match
    // david can only see the analog post (p1 by aaron) — cannot delete it
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
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
    );
  });

  it("calls deletePost when delete is clicked", async () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    const [firstDelete] = screen.getAllByRole("button", { name: /delete post/i });
    await userEvent.click(firstDelete!);
    expect(mockDeleteMutate).toHaveBeenCalledOnce();
  });

  it("shows Inner badge for inner-scoped posts", () => {
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Inner")).toBeInTheDocument();
  });

  it("hides inner posts from non-inner-circle viewer", () => {
    mockCurrentMemberId.mockReturnValue({ data: "david" });
    mockInnerGroup.mockReturnValue({ data: null });
    renderWithProviders(<ProfileWall ownerId={ownerId} />);
    expect(screen.getByText("Hello wall")).toBeInTheDocument();
    expect(screen.queryByText("Inner post")).not.toBeInTheDocument();
  });
});
