import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { CirclesPage } from "./CirclesPage";

const renderCircles = () => renderWithProviders(<CirclesPage />, { path: "/circles", initialEntries: ["/circles"] });
const names = () => screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));
const tab = (name: string) => within(screen.getByRole("group", { name: "Circle types" })).getByRole("button", { name });

describe("CirclesPage", () => {
  it("opens on Inner Circles with member counts", async () => {
    const { container } = renderCircles();
    await screen.findByRole("article", { name: "Inner Circle 4" });
    expect(tab("Inner Circles")).toHaveAttribute("aria-pressed", "true");
    expect(names()).toHaveLength(7);
    expect(within(screen.getByRole("article", { name: "Inner Circle 4" })).getByText("7 members")).toBeInTheDocument();
    expect(within(screen.getByRole("article", { name: "Inner Circle 4" })).getByText("Inner")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps type tabs and the toolbar in one sticky group", async () => {
    renderCircles();
    const controls = await screen.findByRole("group", { name: "Circle controls" });
    expect(within(controls).getByRole("group", { name: "Circle types" })).toBeInTheDocument();
    expect(within(controls).getByRole("searchbox", { name: "Search circles" })).toBeInTheDocument();
  });

  it("switches type tabs single-select", async () => {
    const user = userEvent.setup();
    renderCircles();
    await screen.findByRole("article", { name: "Inner Circle 4" });
    await user.click(tab("Interest Circles"));
    expect(tab("Inner Circles")).toHaveAttribute("aria-pressed", "false");
    expect(names()).toEqual(["Book Club", "Creative Corner", "Hiking & Outdoors", "Padel Crew"]);
  });

  it("searches across all circles", async () => {
    const user = userEvent.setup();
    renderCircles();
    await screen.findByRole("article", { name: "Inner Circle 4" });
    await user.click(tab("All"));
    await user.type(screen.getByRole("searchbox", { name: "Search circles" }), "canal");
    expect(names()).toEqual(["Kreuzberg, Neukölln & Tempelhof"]);
  });

  it("has no favourites filter", async () => {
    const user = userEvent.setup();
    renderCircles();
    await screen.findByRole("article", { name: "Inner Circle 4" });
    await user.click(screen.getByRole("button", { name: "Filter" }));
    const sheet = screen.getByRole("dialog", { name: "Filters" });
    expect(within(sheet).queryByRole("switch", { name: "Favourites only" })).not.toBeInTheDocument();
  });

  it("card links to circle detail", async () => {
    const user = userEvent.setup();
    renderCircles();
    await user.click(await screen.findByRole("link", { name: "Inner Circle 4" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });

  it("creates a circle and opens it", async () => {
    const user = userEvent.setup();
    renderCircles();
    await screen.findByRole("article", { name: "Inner Circle 4" });
    await user.click(screen.getByRole("button", { name: "New circle" }));
    const sheet = screen.getByRole("dialog", { name: "New circle" });
    const create = within(sheet).getByRole("button", { name: "Create circle" });
    expect(create).toBeDisabled();
    expect(within(sheet).queryByRole("radio", { name: "Inner" })).not.toBeInTheDocument();
    await user.type(within(sheet).getByLabelText("Name"), "Film Club");
    await user.type(within(sheet).getByLabelText("Description"), "Old movies, loud opinions.");
    await user.click(create);
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });
});
