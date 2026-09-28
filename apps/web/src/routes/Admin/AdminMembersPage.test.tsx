import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AdminMembersPage } from "./AdminMembersPage";

const renderPage = () => renderWithProviders(<AdminMembersPage />, { path: "/admin/members", initialEntries: ["/admin/members"] });
const innerOf = async (memberId: string) =>
  (await dataSource.listCircles()).find((c) => c.type === "inner" && c.memberIds.includes(memberId))?.id ?? null;
const rowNames = () => within(screen.getByRole("list", { name: "Members" })).getAllByRole("listitem").map((li) => li.getAttribute("aria-label"));

describe("AdminMembersPage", () => {
  it("lists members with badge and meta", async () => {
    const { container } = renderPage();
    expect(await screen.findByText("50 members · 1 not placed")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Members" })).toBeInTheDocument();
    expect(rowNames()).toHaveLength(50);
    const bolu = screen.getByRole("listitem", { name: "Bolu Ajibawo" });
    expect(within(bolu).getByText("None")).toBeInTheDocument();
    expect(within(bolu).getByText("Admin · bolu@example.com")).toBeInTheDocument();
    const odette = screen.getByRole("listitem", { name: "Odette Laurent" });
    expect(within(odette).getByText("IC4")).toBeInTheDocument();
    expect(within(odette).getByText(/^Member · joined /)).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("searches name or email", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("50 members · 1 not placed");
    await user.type(screen.getByRole("searchbox", { name: "Search name or email" }), "blumaa@");
    expect(rowNames()).toEqual(["Aaron Blum"]);
  });

  it("adds a member into an inner circle", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Add member" }));
    const sheet = screen.getByRole("dialog", { name: "New member" });
    await user.type(within(sheet).getByRole("textbox", { name: "Name" }), "Nina Test");
    await user.type(within(sheet).getByRole("textbox", { name: "Email" }), "nina@example.com");
    await user.click(within(sheet).getByRole("radio", { name: "IC3" }));
    await user.click(within(sheet).getByRole("button", { name: "Add member" }));
    expect(await screen.findByText("51 members · 1 not placed")).toBeInTheDocument();
    const nina = (await dataSource.listMembers()).find((m) => m.name === "Nina Test")!;
    expect(nina).toMatchObject({ email: "nina@example.com", role: "member" });
    expect(await innerOf(nina.id)).toBe("ic3");
  });

  it("edits a member and places them", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Edit Bolu Ajibawo" }));
    const sheet = screen.getByRole("dialog", { name: "Edit member" });
    expect(within(sheet).getByRole("textbox", { name: "Email" })).toHaveValue("bolu@example.com");
    expect(within(sheet).getByRole("radio", { name: "Admin" })).toBeChecked();
    expect(within(sheet).getByRole("radio", { name: "None" })).toBeChecked();
    await user.click(within(sheet).getByRole("radio", { name: "IC2" }));
    await user.click(within(sheet).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("50 members · 0 not placed")).toBeInTheDocument();
    expect(await innerOf("bolu")).toBe("ic2");
  });

  it("unplaces a member with None", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Edit Odette Laurent" }));
    const sheet = screen.getByRole("dialog", { name: "Edit member" });
    await user.click(within(sheet).getByRole("radio", { name: "None" }));
    await user.click(within(sheet).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("50 members · 2 not placed")).toBeInTheDocument();
    expect(await innerOf("odette")).toBeNull();
  });

  it("deletes a member after confirming", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Delete Odette Laurent" }));
    await user.click(within(screen.getByRole("dialog", { name: "Delete Odette Laurent?" })).getByRole("button", { name: "Delete member" }));
    expect(await screen.findByText("49 members · 1 not placed")).toBeInTheDocument();
    expect(screen.queryByRole("listitem", { name: "Odette Laurent" })).not.toBeInTheDocument();
  });
});
