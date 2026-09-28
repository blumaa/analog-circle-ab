import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/renderWithProviders";
import { dataSource } from "../../data";
import type { Member, Post } from "../../data/types";
import { PostActions } from "./PostActions";

async function setup(postId: string, memberId: string) {
  const posts = await dataSource.listPosts();
  const members = await dataSource.listMembers();
  const post = posts.find((p) => p.id === postId) as Post;
  const me = members.find((m) => m.id === memberId) as Member;
  return renderWithProviders(<PostActions post={post} me={me} afterDelete="/feed" />, { path: "/" });
}

describe("PostActions", () => {
  it("renders nothing for a member who is not the author", async () => {
    const { container } = await setup("welcome", "nathaly");
    expect(container).toBeEmptyDOMElement();
  });

  it("offers Edit and Delete to the author", async () => {
    const user = userEvent.setup();
    await setup("padel-doubles", "aaron");
    await user.click(screen.getByRole("button", { name: "Post options" }));
    const sheet = screen.getByRole("dialog", { name: "Post options" });
    await user.click(within(sheet).getByRole("button", { name: "Edit post" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });

  it("lets an admin pin a post", async () => {
    const user = userEvent.setup();
    await setup("welcome", "aaron");
    await user.click(screen.getByRole("button", { name: "Post options" }));
    await user.click(screen.getByRole("button", { name: "Pin post" }));
    expect(await screen.findByText("Post pinned")).toBeInTheDocument();
    expect((await dataSource.listPosts()).find((p) => p.id === "welcome")?.pinned).toBe(true);
  });

  it("lets an admin unpin a pinned post", async () => {
    const user = userEvent.setup();
    await setup("brunch-botanico", "aaron");
    await user.click(screen.getByRole("button", { name: "Post options" }));
    await user.click(screen.getByRole("button", { name: "Unpin post" }));
    expect(await screen.findByText("Post unpinned")).toBeInTheDocument();
    expect((await dataSource.listPosts()).find((p) => p.id === "brunch-botanico")?.pinned).toBe(false);
  });

  it("does not offer pinning to members", async () => {
    const user = userEvent.setup();
    await setup("brunch-botanico", "odette");
    await user.click(screen.getByRole("button", { name: "Post options" }));
    expect(screen.queryByRole("button", { name: /Pin post/ })).not.toBeInTheDocument();
  });

  it("lets an admin delete someone else's post after confirming", async () => {
    const user = userEvent.setup();
    await setup("welcome", "aaron");
    await user.click(screen.getByRole("button", { name: "Post options" }));
    expect(screen.queryByRole("button", { name: "Edit post" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete post" }));
    await user.click(within(screen.getByRole("dialog", { name: "Delete post?" })).getByRole("button", { name: "Delete post" }));
    expect(await screen.findByText("Post deleted")).toBeInTheDocument();
    expect((await dataSource.listPosts()).some((p) => p.id === "welcome")).toBe(false);
  });
});
