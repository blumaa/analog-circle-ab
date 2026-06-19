import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileHeader } from "./ProfileHeader";
import type { Member } from "../data";

const member: Member = {
  id: "aaron",
  name: "Aaron Blum",
  email: "aaron@example.com",
  photoUrl: null,
  from: "united states",
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  homeAddress: null,
  location: null,
};

describe("ProfileHeader", () => {
  it("renders the member name", () => {
    render(<ProfileHeader member={member} />);
    expect(screen.getByText("Aaron Blum")).toBeInTheDocument();
  });

  it("renders the member email", () => {
    render(<ProfileHeader member={member} />);
    expect(screen.getByText("aaron@example.com")).toBeInTheDocument();
  });

  it("renders Avatar initials when photoUrl is null", () => {
    render(<ProfileHeader member={member} />);
    // Avatar renders initials as a role=img span
    expect(screen.getByRole("img", { name: "Aaron Blum" })).toBeInTheDocument();
  });

  it("renders Avatar image when photoUrl is provided", () => {
    render(
      <ProfileHeader member={{ ...member, photoUrl: "https://example.com/photo.jpg" }} />,
    );
    expect(screen.getByRole("img", { name: "Aaron Blum" })).toBeInTheDocument();
  });

  it("does not render an edit button when onEdit is not provided", () => {
    render(<ProfileHeader member={member} />);
    expect(screen.queryByRole("button", { name: /edit profile/i })).not.toBeInTheDocument();
  });

  it("renders the pencil edit button when onEdit is provided", () => {
    render(<ProfileHeader member={member} onEdit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /edit profile/i })).toBeInTheDocument();
  });

  it("calls onEdit when the pencil button is clicked", async () => {
    const onEdit = vi.fn();
    render(<ProfileHeader member={member} onEdit={onEdit} />);
    await userEvent.click(screen.getByRole("button", { name: /edit profile/i }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("applies the 116px size class to the Avatar", () => {
    const { container } = render(<ProfileHeader member={member} />);
    // The Avatar receives className={styles.avatarLg} — check the div has the class suffix
    const avatarDiv = container.querySelector("[data-size='lg']");
    expect(avatarDiv?.className).toMatch(/avatarLg/);
  });
});

