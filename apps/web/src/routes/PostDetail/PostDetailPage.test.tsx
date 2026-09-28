import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { PostDetailPage } from "./PostDetailPage";

const renderPost = (id: string) =>
  renderWithProviders(<PostDetailPage />, { path: "/posts/:id", initialEntries: [`/posts/${id}`] });

describe("PostDetailPage", () => {
  it("shows the post with author, text, reactions and comments", async () => {
    const { container } = renderPost("welcome");
    expect(await screen.findByRole("heading", { level: 1, name: "Welcome, new members" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bolu" })).toHaveAttribute("href", "/members/bolu");
    expect(screen.getByText(/tell us your favourite Berlin bakery/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /👋 5/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Comments/ })).toBeInTheDocument();
    expect(await screen.findByText("Hi all! Vote: Albatross bakery.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("saves to favourites", async () => {
    const user = userEvent.setup();
    renderPost("welcome");
    await user.click(await screen.findByRole("button", { name: "Save to favourites" }));
    expect(await screen.findByRole("button", { name: "Remove from favourites" })).toHaveAttribute("aria-pressed", "true");
  });

  it("says when the post does not exist", async () => {
    renderPost("nope");
    expect(await screen.findByText("Post not found.")).toBeInTheDocument();
  });
});
