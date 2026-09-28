import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { CircleDetailPage } from "./CircleDetailPage";

const renderCircle = (id: string) =>
  renderWithProviders(<CircleDetailPage />, { path: "/circles/:id", initialEntries: [`/circles/${id}`] });

describe("CircleDetailPage", () => {
  it("shows the hero, members, upcoming events and posts", async () => {
    const { container } = renderCircle("creative-corner");
    expect(await screen.findByRole("heading", { level: 1, name: "Creative Corner" })).toBeInTheDocument();
    expect(screen.getByText("Interest circle")).toBeInTheDocument();
    expect(screen.getByText(/Drawing, pottery, zines/)).toBeInTheDocument();
    expect(screen.getByText(/\d+ members · started by Georgios/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Member" })).toHaveAttribute("aria-pressed", "true");
    // Only posts can be favourited, never the circle itself.
    for (const star of screen.queryAllByRole("button", { name: /favourites/ })) expect(star.closest("article")).not.toBeNull();
    const members = screen.getByRole("list", { name: "Members" });
    expect(within(members).getByRole("link", { name: "Georgios" })).toHaveAttribute("href", "/members/georgios");
    const upcoming = screen.getByRole("list", { name: "Upcoming" });
    expect(within(upcoming).getByRole("link", { name: /Zine night/ })).toHaveAttribute("href", "/events/zine-night");
    expect(within(upcoming).getByText("Going")).toBeInTheDocument();
    expect(await screen.findByRole("article", { name: /Pottery wheel time/ })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("leaves and rejoins the circle", async () => {
    const user = userEvent.setup();
    renderCircle("creative-corner");
    await user.click(await screen.findByRole("button", { name: "Member" }));
    await user.click(await screen.findByRole("button", { name: "Join" }));
    expect(await screen.findByRole("button", { name: "Member" })).toHaveAttribute("aria-pressed", "true");
  });

  it("has no mute control", async () => {
    renderCircle("creative-corner");
    expect(await screen.findByRole("button", { name: "Member" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mute/ })).not.toBeInTheDocument();
  });

  it("lists every member in a sheet", async () => {
    const user = userEvent.setup();
    renderCircle("creative-corner");
    await user.click(await screen.findByRole("button", { name: /See all/ }));
    const sheet = await screen.findByRole("dialog", { name: "Members" });
    expect(within(sheet).getByRole("link", { name: /Georgios Papadakis/ })).toBeInTheDocument();
  });

  it("opens the edit sheet for admins and creators", async () => {
    const user = userEvent.setup();
    renderCircle("creative-corner");
    await user.click(await screen.findByRole("button", { name: "Edit circle" }));
    expect(await screen.findByRole("dialog", { name: "Edit circle" })).toBeInTheDocument();
  });

  it("filters posts without the published-in group", async () => {
    const user = userEvent.setup();
    renderCircle("creative-corner");
    await user.click(await screen.findByRole("button", { name: /Filter/ }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByRole("region", { name: "Post type" })).toBeInTheDocument();
    expect(within(sheet).queryByRole("region", { name: "Published in" })).not.toBeInTheDocument();
  });

  it("starts a new post from the FAB", async () => {
    const user = userEvent.setup();
    renderCircle("creative-corner");
    await user.click(await screen.findByRole("button", { name: "New post" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });

  it("offers a new post only to members", async () => {
    renderCircle("book-club");
    await screen.findByRole("button", { name: "Join" });
    expect(screen.queryByRole("button", { name: "New post" })).not.toBeInTheDocument();
  });

  it("says when the circle doesn't exist", async () => {
    renderCircle("nope");
    expect(await screen.findByText("Circle not found.")).toBeInTheDocument();
  });
});
