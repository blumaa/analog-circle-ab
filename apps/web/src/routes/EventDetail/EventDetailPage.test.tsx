import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { EventDetailPage } from "./EventDetailPage";

const renderEvent = (id: string) =>
  renderWithProviders(<EventDetailPage />, { path: "/events/:id", initialEntries: [`/events/${id}`] });

describe("EventDetailPage", () => {
  it("shows the event with info, attendees, about and comments", async () => {
    const { container } = renderEvent("story-circle-33");
    expect(await screen.findByRole("heading", { level: 1, name: "Story Circle #33" })).toBeInTheDocument();
    expect(screen.getByText(/^Event · /i)).toBeInTheDocument();
    expect(screen.getByText(/Hosted by/)).toHaveTextContent("Hosted by Yetunde");
    const info = screen.getByRole("list", { name: "Event details" });
    expect(within(info).getByText("Oranienstraße 25, 10999 Berlin")).toBeInTheDocument();
    expect(within(info).getByRole("link", { name: /Map/ })).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
    expect(within(info).getByText("22 spots left of 30 · friends welcome")).toBeInTheDocument();
    expect(screen.getByText("8 going")).toBeInTheDocument();
    expect(screen.getByText(/lost and found/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Comments/ })).toBeInTheDocument();
    expect(await screen.findByText("Signing up to tell one this time!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove from favourites" })).toHaveAttribute("aria-pressed", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("confirms before RSVPing going and before leaving", async () => {
    const user = userEvent.setup();
    renderEvent("story-circle-33");
    const going = await screen.findByRole("button", { name: "Going" });
    expect(going).toHaveAttribute("aria-pressed", "false");
    await user.click(going);
    const join = screen.getByRole("dialog", { name: "Going to Story Circle #33?" });
    expect(join).toHaveTextContent("Sat 17 Oct");
    await user.click(within(join).getByRole("button", { name: "I'm going" }));
    expect(await screen.findByText("9 going")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Going" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Can't make it" }));
    await user.click(within(screen.getByRole("dialog", { name: "Leave Story Circle #33?" })).getByRole("button", { name: "Leave event" }));
    expect(await screen.findByText("8 going")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Can't make it" })).toHaveAttribute("aria-pressed", "true");
  });

  it("cancelling the confirmation changes nothing", async () => {
    const user = userEvent.setup();
    renderEvent("story-circle-33");
    await user.click(await screen.findByRole("button", { name: "Going" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("8 going")).toBeInTheDocument();
  });

  it("declines without confirming when not going", async () => {
    const user = userEvent.setup();
    renderEvent("story-circle-33");
    await user.click(await screen.findByRole("button", { name: "Can't make it" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Can't make it" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lists everyone going", async () => {
    const user = userEvent.setup();
    renderEvent("story-circle-33");
    await user.click(await screen.findByRole("button", { name: "See all" }));
    const sheet = screen.getByRole("dialog", { name: "Going" });
    expect(within(sheet).getAllByRole("listitem")).toHaveLength(8);
  });

  it("hides the address when it isn't visible", async () => {
    renderEvent("padel-doubles");
    await screen.findByRole("heading", { level: 1, name: "Padel doubles, date TBD" });
    expect(screen.queryByText(/Holzmarktstraße/)).not.toBeInTheDocument();
  });

  it("doesn't show events the viewer can't see", async () => {
    renderEvent("dinner-ic1-0");
    expect(await screen.findByText("Event not found.")).toBeInTheDocument();
  });
});
