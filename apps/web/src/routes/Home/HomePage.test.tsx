import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { HomePage } from "./HomePage";

const renderHome = () => renderWithProviders(<HomePage />, { path: "/" });
const titles = () => screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));

describe("HomePage", () => {
  it("lists visible posts with the pinned event first", async () => {
    const { container } = renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    expect(titles()[0]).toBe("Sunday brunch at Café Botanico");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps feed tabs and the toolbar in one sticky group", async () => {
    renderHome();
    const controls = await screen.findByRole("group", { name: "Feed controls" });
    expect(within(controls).getByRole("group", { name: "Feeds" })).toBeInTheDocument();
    expect(within(controls).getByRole("searchbox", { name: "Search" })).toBeInTheDocument();
    expect(within(controls).queryByRole("article")).not.toBeInTheDocument();
  });

  it("feed tabs toggle independently and All clears them", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    const tabs = screen.getByRole("group", { name: "Feeds" });
    await user.click(within(tabs).getByRole("button", { name: "The Square" }));
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("article", { name: "Welcome, new members" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Story Circle #33" })).toBeInTheDocument();

    await user.click(within(tabs).getByRole("button", { name: "The Loop" }));
    expect(screen.getByRole("article", { name: "Welcome, new members" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(within(tabs).getByRole("button", { name: "The Square" })).toHaveAttribute("aria-pressed", "false");
  });

  it("favourites chip shows saved posts only", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    await user.click(screen.getByRole("button", { name: "Favourites" }));
    expect(titles()).toEqual(["Story Circle #33"]);
  });

  it("searches titles, text and authors", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "bakery");
    expect(titles()).toEqual(["Welcome, new members"]);
  });

  it("searches comments and event addresses", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    const search = screen.getByRole("searchbox", { name: "Search" });
    await user.type(search, "lemon tree");
    await waitFor(() => expect(titles()).toEqual(["Sunday brunch at Café Botanico"]));
    await user.clear(search);
    await user.type(search, "Oranienstraße");
    expect(titles()).toEqual(["Story Circle #33"]);
  });

  it("filters by post type with a live result count", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    await user.click(screen.getByRole("button", { name: "Filter" }));
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    await user.click(within(sheet).getByRole("button", { name: "Offer" }));
    await user.click(within(sheet).getByRole("button", { name: "Show 1 result" }));
    expect(titles()).toEqual(["Pottery wheel time on Thursdays"]);
    expect(screen.getByRole("button", { name: "Filter, 1 active" })).toBeInTheDocument();
  });

  it("sorts by most comments", async () => {
    const user = userEvent.setup();
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    await user.click(screen.getByRole("button", { name: "Sort" }));
    const sheet = screen.getByRole("dialog", { name: "Sort by" });
    await user.click(within(sheet).getByRole("radio", { name: "Most comments" }));
    await user.click(within(sheet).getByRole("button", { name: "Apply" }));
    // Pinned stays on top; Story Circle (2) ties Welcome (2), newer first.
    expect(titles().slice(0, 2)).toEqual(["Sunday brunch at Café Botanico", "Welcome, new members"]);
  });

  it("has no view toggle", async () => {
    renderHome();
    await screen.findByRole("article", { name: "Welcome, new members" });
    expect(screen.queryByRole("button", { name: /^View/ })).not.toBeInTheDocument();
  });

  it("the FAB opens the New form", async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(await screen.findByRole("button", { name: "New post" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });
});
