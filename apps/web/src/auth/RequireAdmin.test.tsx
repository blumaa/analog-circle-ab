import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { dataSource } from "../data";
import { renderWithProviders } from "../test/renderWithProviders";
import { RequireAdmin } from "./RequireAdmin";

const renderGuard = () =>
  renderWithProviders(
    <RequireAdmin>
      <p>Admin only</p>
    </RequireAdmin>,
    { path: "/admin", initialEntries: ["/admin"] },
  );

describe("RequireAdmin", () => {
  it("shows admin pages to admins", async () => {
    renderGuard();
    expect(await screen.findByText("Admin only")).toBeInTheDocument();
  });

  it("sends members away", async () => {
    await dataSource.devSignInAs("odette");
    renderGuard();
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
    expect(screen.queryByText("Admin only")).not.toBeInTheDocument();
  });
});
