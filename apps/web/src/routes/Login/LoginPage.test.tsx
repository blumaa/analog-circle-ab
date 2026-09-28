import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { LoginPage } from "./LoginPage";

const renderLogin = () => renderWithProviders(<LoginPage />, { path: "/login", initialEntries: ["/login"] });

describe("LoginPage", () => {
  it("renders the branded email sign-in form", async () => {
    const { container } = renderLogin();
    expect(screen.getByRole("heading", { level: 1, name: "Sign in with email" })).toBeInTheDocument();
    expect(screen.getByText("The Analog Circle")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Email sign-in link" })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("signs in with a member's email and leaves the page", async () => {
    const user = userEvent.setup();
    await dataSource.signOut();
    renderLogin();
    const members = await dataSource.listMembers();
    await user.type(screen.getByLabelText("Email address"), members[0]!.email);
    await user.click(screen.getByRole("button", { name: "Email sign-in link" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
  });

  it("offers a dev sign-in shortcut", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Dev sign-in (skip email)" })).toBeInTheDocument();
  });
});
