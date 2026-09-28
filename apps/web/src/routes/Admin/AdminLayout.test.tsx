import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { AdminLayout } from "./AdminLayout";

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="circles" element={<p>Circles admin</p>} />
        <Route path="members" element={<p>Members admin</p>} />
      </Route>
    </Routes>,
    { initialEntries: ["/admin/circles"] },
  );

describe("AdminLayout", () => {
  it("links the admin sections and marks the current one", async () => {
    const user = userEvent.setup();
    const { container } = renderLayout();
    const nav = screen.getByRole("navigation", { name: "Admin" });
    expect(within(nav).getByRole("link", { name: "Circles" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Metrics" })).toHaveAttribute("href", "/admin/metrics");
    expect(within(nav).getByRole("link", { name: "Feedback" })).toHaveAttribute("href", "/admin/feedback");
    expect(screen.getByText("Circles admin")).toBeInTheDocument();
    await user.click(within(nav).getByRole("link", { name: "Members" }));
    expect(screen.getByText("Members admin")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
