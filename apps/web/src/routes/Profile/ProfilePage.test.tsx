import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";

const mockCurrentMemberId = vi.fn();
const mockMember = vi.fn();
const mockInnerGroup = vi.fn();
const mockUpdateMutate = vi.fn();
const mockWallPosts = vi.fn();
const mockMembers = vi.fn();
const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock("../../data/hooks", () => ({
  useCurrentMemberId: () => mockCurrentMemberId(),
  useMember: () => mockMember(),
  useInnerGroup: () => mockInnerGroup(),
  useUpdateMember: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useWallPosts: () => mockWallPosts(),
  useMembers: () => mockMembers(),
  useCreateWallPost: () => ({ mutate: mockCreateMutate }),
  useDeleteWallPost: () => ({ mutate: mockDeleteMutate }),
  useToggleWallPostLike: () => ({ mutate: vi.fn() }),
  useAddWallPostReply: () => ({ mutate: vi.fn() }),
  useActivity: () => ({ data: [] }),
}));

vi.mock("../../data", () => ({
  dataSource: { signOut: vi.fn() },
}));

import { ProfilePage } from "./ProfilePage";

const member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "aaron@test.com",
  photoUrl: null,
  from: "NYC",
  bio: "Test bio",
  interests: ["hiking", "music"],
  dietary: "Vegetarian",
  whatsappUrl: null,
  homeAddress: null,
  location: null,
};

beforeEach(() => {
  mockCurrentMemberId.mockReturnValue({ data: "aaron" });
  mockMember.mockReturnValue({ data: member });
  mockInnerGroup.mockReturnValue({ data: null });
  mockWallPosts.mockReturnValue({ data: [] });
  mockMembers.mockReturnValue({ data: [member] });
  mockUpdateMutate.mockClear();
  mockCreateMutate.mockClear();
  mockDeleteMutate.mockClear();
});

describe("ProfilePage edit mode", () => {
  it("shows pencil edit button", () => {
    renderWithProviders(<ProfilePage />);
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
  });

  it("shows edit form when pencil button is clicked", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByRole("button", { name: /^Save$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Cancel$/i })).toBeInTheDocument();
  });

  it("pre-fills form with current member data", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByDisplayValue("NYC")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hiking, music")).toBeInTheDocument();
  });

  it("calls updateMember.mutate on Save", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    await userEvent.click(screen.getByRole("button", { name: /^Save$/i }));
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "aaron", patch: expect.objectContaining({ from: "NYC" }) }),
      expect.any(Object),
    );
  });

  it("exits edit mode on Cancel", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    await userEvent.click(screen.getByRole("button", { name: /^Cancel$/i }));
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Save$/i })).not.toBeInTheDocument();
  });

  it("hides the edit button when in edit mode", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    // pencil button should disappear while editing
    expect(screen.queryByRole("button", { name: /edit profile/i })).not.toBeInTheDocument();
  });

  it("includes homeAddress field in the edit form", async () => {
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(screen.getByLabelText(/home address/i)).toBeInTheDocument();
  });

  it("includes homeAddress in the patch on save", async () => {
    const memberWithAddress = { ...member, homeAddress: "Test Street 1" };
    mockMember.mockReturnValue({ data: memberWithAddress });
    renderWithProviders(<ProfilePage />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    await userEvent.click(screen.getByRole("button", { name: /^Save$/i }));
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        patch: expect.objectContaining({ homeAddress: "Test Street 1" }),
      }),
      expect.any(Object),
    );
  });
});
