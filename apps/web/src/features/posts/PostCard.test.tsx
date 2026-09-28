import { describe, expect, it } from "vitest";
import { useState } from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { usePosts } from "../../data/hooks";
import { PostCard } from "./PostCard";

function Harness({ id }: { id: string }) {
  const { data: posts = [] } = usePosts();
  const [expanded, setExpanded] = useState(false);
  const post = posts.find((p) => p.id === id);
  if (!post) return null;
  return <PostCard post={post} expanded={expanded} onToggleComments={() => setExpanded((e) => !e)} />;
}

const renderCard = (id: string) => renderWithProviders(<Harness id={id} />, { path: "/", initialEntries: ["/"] });

describe("PostCard", () => {
  it("renders an event with its tag, date, going count and detail link", async () => {
    const { container } = renderCard("brunch-botanico");
    const card = await screen.findByRole("article", { name: "Sunday brunch at Café Botanico" });
    expect(within(card).getByRole("link", { name: "Sunday brunch at Café Botanico" })).toHaveAttribute(
      "href",
      "/events/brunch-botanico",
    );
    expect(within(card).getByText("5 going")).toBeInTheDocument();
    expect(within(card).getByRole("img", { name: "Pinned" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("marks Inner Circle posts for the special border", async () => {
    renderCard("brunch-botanico");
    const inner = await screen.findByRole("article", { name: "Sunday brunch at Café Botanico" });
    expect(inner).toHaveAttribute("data-inner-circle");
  });

  it("leaves other posts unmarked", async () => {
    renderCard("welcome");
    const card = await screen.findByRole("article", { name: "Welcome, new members" });
    expect(card).not.toHaveAttribute("data-inner-circle");
  });

  it("links a post title to the post page", async () => {
    renderCard("welcome");
    const card = await screen.findByRole("article", { name: "Welcome, new members" });
    expect(within(card).getByRole("link", { name: "Welcome, new members" })).toHaveAttribute("href", "/posts/welcome");
  });

  it("confirms the viewer's RSVP and leaving", async () => {
    const user = userEvent.setup();
    renderCard("story-circle-33");
    await user.click(await screen.findByRole("button", { name: "RSVP" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "Going to Story Circle #33?" })).getByRole("button", {
        name: "I'm going",
      }),
    );
    expect(await screen.findByRole("button", { name: "Going ✓" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("9 going")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Going ✓" }));
    await user.click(
      within(screen.getByRole("dialog", { name: "Leave Story Circle #33?" })).getByRole("button", {
        name: "Leave event",
      }),
    );
    expect(await screen.findByRole("button", { name: "RSVP" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("8 going")).toBeInTheDocument();
  });

  it("adds a reaction from the picker", async () => {
    const user = userEvent.setup();
    renderCard("offer-wheel");
    await user.click(await screen.findByRole("button", { name: /React$/ }));
    await user.click(
      within(screen.getByRole("group", { name: "Pick a reaction" })).getByRole("button", { name: /🙌/ }),
    );
    expect(await screen.findByRole("button", { name: /🙌 1/ })).toBeInTheDocument();
  });

  it("sums several reactions in one pill with the top emoji", async () => {
    renderCard("story-circle-33");
    const pill = await screen.findByRole("button", { name: "Reactions: 🔥 4, ❤️ 1. React" });
    expect(pill).toHaveTextContent(/^🔥❤️5$/);
  });

  it("opens the list of members going", async () => {
    const user = userEvent.setup();
    renderCard("brunch-botanico");
    await user.click(await screen.findByRole("button", { name: "See who's going (5)" }));
    const sheet = await screen.findByRole("dialog", { name: "Going" });
    expect(within(sheet).getAllByRole("link")).toHaveLength(5);
  });

  it("saves to favourites", async () => {
    const user = userEvent.setup();
    renderCard("offer-wheel");
    await user.click(await screen.findByRole("button", { name: "Save to favourites" }));
    expect(await screen.findByRole("button", { name: "Remove from favourites" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("expands the comment thread", async () => {
    const user = userEvent.setup();
    renderCard("welcome");
    const toggle = await screen.findByRole("button", { name: "2 comments" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByText("Hi all! Vote: Albatross bakery.")).toBeInTheDocument();
  });
});
