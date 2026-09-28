import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AdminCirclesPage } from "./AdminCirclesPage";

const renderPage = () => renderWithProviders(<AdminCirclesPage />, { path: "/admin/circles", initialEntries: ["/admin/circles"] });
const circleIds = async (circleId: string) => (await dataSource.listCircles()).find((c) => c.id === circleId)!.memberIds;

describe("AdminCirclesPage", () => {
  it("lists every circle with counts and meta", async () => {
    const { container } = renderPage();
    expect(await screen.findByText("14 circles · 50 members")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Circles" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(14);
    const ic4 = screen.getByRole("article", { name: "Inner Circle 4" });
    expect(within(ic4).getByText(/^Inner · 7 of 7 members/)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("filters by type and search", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("14 circles · 50 members");
    await user.click(screen.getByRole("button", { name: "Inner" }));
    expect(screen.getAllByRole("article")).toHaveLength(7);
    await user.click(screen.getByRole("button", { name: "All" }));
    await user.type(screen.getByRole("searchbox", { name: "Search circles" }), "padel");
    expect(screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"))).toEqual(["Padel Crew"]);
  });

  it("edits a circle in a sheet", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Edit Padel Crew" }));
    const sheet = screen.getByRole("dialog", { name: "Edit circle" });
    expect(within(sheet).getByRole("textbox", { name: "Name" })).toHaveValue("Padel Crew");
  });

  it("deletes a circle after confirming", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Delete Padel Crew" }));
    await user.click(within(screen.getByRole("dialog", { name: "Delete Padel Crew?" })).getByRole("button", { name: "Delete circle" }));
    expect(await screen.findByText("13 circles · 50 members")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "Padel Crew" })).not.toBeInTheDocument();
  });

  it("removes and adds members in an expanded circle", async () => {
    const user = userEvent.setup();
    renderPage();
    const ic4 = await screen.findByRole("article", { name: "Inner Circle 4" });
    await user.click(within(ic4).getByRole("button", { name: "Show members of Inner Circle 4" }));
    const list = within(ic4).getByRole("list", { name: "Inner Circle 4 members" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(7);

    await user.click(within(list).getByRole("button", { name: "Remove Odette Laurent" }));
    expect(await within(ic4).findByText(/^Inner · 6 of 7 members/)).toBeInTheDocument();
    expect(await circleIds("ic4")).not.toContain("odette");

    await user.click(within(ic4).getByRole("button", { name: "Add member" }));
    const sheet = screen.getByRole("dialog", { name: "Add to Inner Circle 4" });
    await user.type(within(sheet).getByRole("searchbox", { name: "Search members" }), "bolu");
    await user.click(within(sheet).getByRole("button", { name: /Bolu Ajibawo/ }));
    expect(await within(ic4).findByText(/^Inner · 7 of 7 members/)).toBeInTheDocument();
    expect(await circleIds("ic4")).toContain("bolu");
  });
});
