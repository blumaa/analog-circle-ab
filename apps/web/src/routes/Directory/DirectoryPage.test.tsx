import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { DirectoryPage } from "./DirectoryPage";

const renderDirectory = () => renderWithProviders(<DirectoryPage />, { path: "/directory", initialEntries: ["/directory"] });
const toggle = (name: string) => screen.getByRole("button", { name });
const rows = () => within(screen.getByRole("list", { name: "Members" })).getAllByRole("listitem");

describe("DirectoryPage", () => {
  it("lists members A to Z with a count and contact links", async () => {
    const { container } = renderDirectory();
    expect(await screen.findByRole("heading", { name: "Directory" })).toBeInTheDocument();
    await screen.findByRole("button", { name: "Aaron B." });
    expect(screen.getByText(`${rows().length} members`)).toBeInTheDocument();
    expect(within(rows()[0]!).getByRole("button", { name: "Aaron B." })).toBeInTheDocument();
    const aaron = rows()[0]!;
    expect(within(aaron).getByText("IC4")).toBeInTheDocument();
    expect(within(aaron).getByRole("link", { name: "Email Aaron B." })).toHaveAttribute("href", "mailto:blumaa@gmail.com");
    expect(within(aaron).getByRole("link", { name: "WhatsApp Aaron B." })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("expands one member at a time with bio, circles and a profile link", async () => {
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByRole("button", { name: "Georgios P." });
    await user.click(toggle("Georgios P."));
    expect(toggle("Georgios P.")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Illustrator. Started Creative Corner.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More details" })).toHaveAttribute("href", "/members/georgios");
    await user.click(toggle("Aaron B."));
    expect(toggle("Georgios P.")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Illustrator. Started Creative Corner.")).not.toBeInTheDocument();
  });

  it("searches names and bios", async () => {
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByRole("button", { name: "Aaron B." });
    await user.type(screen.getByRole("searchbox", { name: "Search members" }), "ceramicist");
    expect(rows()).toHaveLength(1);
    expect(screen.getByText("1 member")).toBeInTheDocument();
  });

  it("filters by inner circle", async () => {
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByRole("button", { name: "Aaron B." });
    await user.click(screen.getByRole("button", { name: "Filter" }));
    await user.click(within(screen.getByRole("region", { name: "Inner Circle" })).getByRole("button", { name: "IC4" }));
    await user.click(screen.getByRole("button", { name: "Show 7 results" }));
    expect(rows()).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Filter, 1 active" })).toBeInTheDocument();
  });

  it("switches to the compact view without contact buttons", async () => {
    const user = userEvent.setup();
    renderDirectory();
    await screen.findByRole("button", { name: "Aaron B." });
    await user.click(screen.getByRole("button", { name: "View: cards" }));
    expect(screen.queryByRole("link", { name: "Email Aaron B." })).not.toBeInTheDocument();
  });
});
