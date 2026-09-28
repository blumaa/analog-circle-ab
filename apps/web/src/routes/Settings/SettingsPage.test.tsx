import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { SettingsPage } from "./SettingsPage";

const renderSettings = () => renderWithProviders(<SettingsPage />, { path: "/settings", initialEntries: ["/settings"] });
const prefs = () => dataSource.getPrefs("aaron");
const group = (name: string) => screen.getByRole("group", { name });

describe("SettingsPage", () => {
  it("shows settings with a way back to the profile", async () => {
    const { container } = renderSettings();
    expect(await screen.findByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("turns off the birthday post", async () => {
    const user = userEvent.setup();
    renderSettings();
    const toggle = await screen.findByRole("switch", { name: "Birthday celebration" });
    expect(toggle).toBeChecked();
    await user.click(toggle);
    await waitFor(async () => expect((await dataSource.getMember("aaron"))?.birthdayPost).toBe(false));
    expect(toggle).not.toBeChecked();
  });

  it("changes how notifications arrive", async () => {
    const user = userEvent.setup();
    renderSettings();
    const channel = await screen.findByRole("group", { name: "How I hear about them" });
    expect(within(channel).getByRole("button", { name: "Push only" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(channel).getByRole("button", { name: "Email only" }));
    await waitFor(async () => expect((await prefs()).channel).toBe("email"));
    expect(screen.getByText("Push is set up per device. Check this one is turned on.")).toBeInTheDocument();
  });

  it("saves each notification toggle on its own", async () => {
    const user = userEvent.setup();
    renderSettings();
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    const toggle = within(group("Experiences")).getByRole("switch", { name: "Reminders before experiences I'm going to" });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    await waitFor(async () => expect((await prefs()).notifications.experienceReminders).toBe(true));
    expect((await prefs()).notifications.dinnerFeedback).toBe(true);

    await user.click(within(group("Inner Circle dinners")).getByRole("switch", { name: "Feedback afterwards" }));
    await waitFor(async () => expect((await prefs()).notifications.dinnerFeedback).toBe(false));
    expect(within(group("Experiences")).getByRole("switch", { name: "Feedback afterwards" })).toBeChecked();
  });

  it("shows always-on notifications as locked", async () => {
    renderSettings();
    await screen.findByRole("heading", { level: 1, name: "Settings" });
    const locked = [
      within(group("The Loop")).getByRole("switch", { name: "Replies to my posts" }),
      within(group("My catch-ups")).getByRole("switch", { name: "My catch-ups" }),
      within(group("From The Analog Circle")).getByRole("switch", { name: "From The Analog Circle" }),
    ];
    for (const toggle of locked) {
      expect(toggle).toBeChecked();
      expect(toggle).toHaveAttribute("aria-disabled", "true");
    }
    expect(screen.queryByRole("group", { name: "Circles" })).not.toBeInTheDocument();
    expect(screen.getByText("Cancellations and hosting swaps always reach me.")).toBeInTheDocument();
  });
});
