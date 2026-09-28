import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AdminFeedbackPage } from "./AdminFeedbackPage";

const renderPage = () =>
  renderWithProviders(<AdminFeedbackPage />, { path: "/admin/feedback", initialEntries: ["/admin/feedback"] });

describe("AdminFeedbackPage", () => {
  it("shows feedback in a table, newest first", async () => {
    await dataSource.sendFeedback("aaron", "Newest note");
    const { container } = renderPage();
    const table = await screen.findByRole("table", { name: "Feedback" });
    expect(screen.getByRole("heading", { level: 1, name: "Feedback" })).toBeInTheDocument();
    const headers = within(table).getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers).toEqual(["From", "Feedback", "Date", "Actions"]);
    const [, first] = within(table).getAllByRole("row");
    expect(within(first!).getByText("Aaron Blum")).toBeInTheDocument();
    expect(within(first!).getByText("Newest note")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("deletes a feedback entry", async () => {
    const user = userEvent.setup();
    await dataSource.sendFeedback("aaron", "Remove me");
    renderPage();
    const row = (await screen.findByText("Remove me")).closest("tr") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "Delete feedback from Aaron Blum" }));
    await waitFor(() => expect(screen.queryByText("Remove me")).not.toBeInTheDocument());
  });
});
