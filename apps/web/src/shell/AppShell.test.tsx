import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { axe } from "jest-axe";
import { renderWithProviders } from "../test/renderWithProviders";
import { dataSource } from "../data";
import { AppShell } from "./AppShell";
import { firstName } from "../lib/names";

function renderShell(entry = "/", showTabs = true) {
  return renderWithProviders(
    <Routes>
      <Route element={<AppShell showTabs={showTabs} />}>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/circles" element={<p>Circles page</p>} />
        <Route path="/settings" element={<p>Settings page</p>} />
        <Route path="/admin" element={<p>Admin page</p>} />
        <Route path="*" element={<p>Other page</p>} />
      </Route>
    </Routes>,
    { initialEntries: [entry] },
  );
}

describe("AppShell", () => {
  it("shows the wordmark, the Berlin pill on Home, and the signed-in member", async () => {
    const { container } = renderShell("/");
    expect(screen.getByText("The Analog Circle")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(await screen.findByText("Aaron")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("hides the Berlin pill off Home and marks the active tab", async () => {
    renderShell("/circles");
    expect(screen.queryByText("Berlin")).not.toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "Circles" })).toHaveAttribute("aria-current", "page");
  });

  it("omits the tab bar when showTabs is false", () => {
    renderShell("/", false);
    expect(screen.queryByRole("navigation", { name: "Main" })).not.toBeInTheDocument();
  });

  it("opens the menu with an Admin row for admins and navigates", async () => {
    const user = userEvent.setup();
    renderShell("/");
    await screen.findByText("Aaron");
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const sheet = screen.getByRole("dialog", { name: "Menu" });
    await user.click(within(sheet).getByRole("button", { name: "Admin" }));
    expect(await screen.findByText("Admin page")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides the Admin row from members", async () => {
    const user = userEvent.setup();
    const members = await dataSource.listMembers();
    const plain = members.find((m) => m.role === "member");
    if (!plain) throw new Error("seed has no plain member");
    await dataSource.devSignInAs(plain.id);
    renderShell("/");
    await screen.findByRole("link", { name: new RegExp(firstName(plain.name)) });
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const sheet = screen.getByRole("dialog", { name: "Menu" });
    expect(within(sheet).queryByRole("button", { name: "Admin" })).not.toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "Settings" })).toBeInTheDocument();
  });

  it("opens notifications and marks all read", async () => {
    const user = userEvent.setup();
    renderShell("/");
    const bell = await screen.findByRole("button", { name: /Notifications, \d+ unread/ });
    await user.click(bell);
    const sheet = screen.getByRole("dialog", { name: "Notifications" });
    await user.click(within(sheet).getByRole("button", { name: "Mark all read" }));
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("sends feedback from the menu", async () => {
    const user = userEvent.setup();
    renderShell("/");
    await user.click(await screen.findByRole("button", { name: "Menu" }));
    await user.click(within(await screen.findByRole("dialog", { name: "Menu" })).getByRole("button", { name: "Give feedback" }));
    const sheet = await screen.findByRole("dialog", { name: "Give feedback" });
    const send = within(sheet).getByRole("button", { name: "Send" });
    expect(send).toBeDisabled();
    await user.type(within(sheet).getByLabelText("Your feedback"), "More padel please");
    await user.click(send);
    expect(await screen.findByText("Thanks for the feedback")).toBeInTheDocument();
    expect((await dataSource.listFeedback())[0]).toMatchObject({ authorId: "aaron", body: "More padel please" });
  });
});
