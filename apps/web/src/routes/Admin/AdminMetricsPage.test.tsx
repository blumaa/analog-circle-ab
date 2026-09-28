import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AdminMetricsPage } from "./AdminMetricsPage";

const renderPage = () => renderWithProviders(<AdminMetricsPage />, { path: "/admin/metrics", initialEntries: ["/admin/metrics"] });

describe("AdminMetricsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 5, 12)); // Mon 5 Oct 2026
  });
  afterEach(() => vi.useRealTimers());

  it("shows the tree and this week's numbers", async () => {
    const { container } = renderPage();
    const week = await screen.findByRole("region", { name: "This week" });
    expect(screen.getByText("Maturing · 9.5 months old")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Product metrics" })).toBeInTheDocument();
    expect(within(week).getByText("Mon 5 Oct – Sun 11 Oct · Berlin time")).toBeInTheDocument();
    expect(within(week).getByRole("button", { name: "New members: 0" })).toBeInTheDocument();
    const going = within(week).getByRole("group", { name: "Going" });
    expect(within(going).getByText("23")).toBeInTheDocument();
    expect(within(going).getByText("(85%)")).toBeInTheDocument();
    const cancellations = within(week).getByRole("group", { name: "Cancellations" });
    expect(within(cancellations).getByText("4")).toBeInTheDocument();
    expect(within(cancellations).getByText("(15%)")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("drills into this week's experiences", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole("button", { name: "Experiences: 4" }));
    const sheet = screen.getByRole("dialog", { name: "Experiences this week" });
    expect(within(sheet).getAllByRole("link")).toHaveLength(4);
    expect(within(sheet).getByRole("link", { name: /IC2 dinner/ })).toHaveAttribute("href", "/events/dinner-ic2-3");
  });

  it("switches period and opens a ranked list", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByRole("button", { name: "Last 30 days" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Inactive: 0" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Most active creators: 16" }));
    const sheet = screen.getByRole("dialog", { name: "Most active creators" });
    expect(within(sheet).getByRole("link", { name: /Yetunde Adeyemi/ })).toHaveTextContent("2 posts");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Last 7 days" }));
    expect(screen.getByRole("button", { name: "Most active creators: 11" })).toBeInTheDocument();
  });

  it("lists inner circle members who missed dinners", async () => {
    renderPage();
    const two = await screen.findByRole("list", { name: "Missed 2 dinners in a row" });
    expect(within(two).getByText("Yuki Costa")).toBeInTheDocument();
    const three = screen.getByRole("list", { name: "Missed 3 dinners in a row" });
    expect(within(three).getByText("Priya Ito")).toBeInTheDocument();
  });

  it("shows a member's experience history", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findByText("Type a name to see what they have been to.")).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox", { name: "Search members" }), "odette");
    await user.click(screen.getByRole("button", { name: "Odette Laurent" }));
    const history = screen.getByRole("list", { name: "Experiences Odette Laurent attended" });
    expect(within(history).getAllByRole("link")).toHaveLength(3);
    expect(screen.getByText("3 experiences attended")).toBeInTheDocument();
  });
});
