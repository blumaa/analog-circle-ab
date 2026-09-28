import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { ProfilePage } from "./ProfilePage";

const renderOwn = () => renderWithProviders(<ProfilePage />, { path: "/profile", initialEntries: ["/profile"] });
const renderMember = (id: string) =>
  renderWithProviders(<ProfilePage />, { path: "/members/:id", initialEntries: [`/members/${id}`] });

describe("ProfilePage", () => {
  it("shows the viewer's own profile with edit and settings", async () => {
    const { container } = renderOwn();
    expect(await screen.findByRole("heading", { level: 1, name: "Aaron B." })).toBeInTheDocument();
    expect(screen.getByText("IC4")).toBeInTheDocument();
    expect(screen.getByText(/^Member since /)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit profile" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    expect(screen.getByText(/Former teacher, current coder/)).toBeInTheDocument();
    const contact = screen.getByRole("list", { name: "Contact" });
    expect(within(contact).getByRole("link", { name: /Email/ })).toHaveAttribute("href", "mailto:blumaa@gmail.com");
    expect(within(contact).getByText("Birthday")).toBeInTheDocument();
    const circles = screen.getByRole("list", { name: "Circles" });
    expect(within(circles).getByText("Inner Circle 4")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows another member without edit controls", async () => {
    renderMember("georgios");
    expect(await screen.findByRole("heading", { level: 1, name: "Georgios P." })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit profile" })).not.toBeInTheDocument();
    expect(screen.getByText("Illustrator. Started Creative Corner.")).toBeInTheDocument();
  });

  it("masks another member's contact details until tapped", async () => {
    const user = userEvent.setup();
    renderMember("georgios");
    const contact = await screen.findByRole("list", { name: "Contact" });
    expect(within(contact).queryByRole("link", { name: /Email/ })).not.toBeInTheDocument();
    const email = within(contact).getByRole("button", { name: /^Email/ });
    expect(email).toHaveTextContent("•••@");
    await user.click(email);
    const link = within(contact).getByRole("link", { name: /Email/ });
    expect(link.getAttribute("href")).toMatch(/^mailto:/);
    expect(link).not.toHaveTextContent("•");
  });

  it("treats /members/<own id> as the own profile", async () => {
    renderMember("aaron");
    expect(await screen.findByRole("button", { name: "Edit profile" })).toBeInTheDocument();
  });

  it("says when a member doesn't exist", async () => {
    renderMember("nobody");
    expect(await screen.findByText("Member not found.")).toBeInTheDocument();
  });

  it("edits the own profile", async () => {
    const user = userEvent.setup();
    renderOwn();
    await user.click(await screen.findByRole("button", { name: "Edit profile" }));
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    const bio = within(dialog).getByLabelText("Bio");
    await user.clear(bio);
    await user.type(bio, "Padel every Tuesday.");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Padel every Tuesday.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Edit profile" })).not.toBeInTheDocument();
  });

  it("changes the own profile photo", async () => {
    const user = userEvent.setup();
    renderOwn();
    await user.click(await screen.findByRole("button", { name: "Edit profile" }));
    const dialog = screen.getByRole("dialog", { name: "Edit profile" });
    await user.click(within(dialog).getByRole("button", { name: "Remove picture" }));
    await user.upload(within(dialog).getByLabelText("Profile photo"), new File(["hi"], "me.png", { type: "image/png" }));
    expect(await within(dialog).findByRole("img", { name: "Profile photo preview" })).toHaveAttribute("src", "data:image/png;base64,aGk=");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit profile" })).not.toBeInTheDocument());
    expect((await dataSource.getMember("aaron"))?.photoUrl).toBe("data:image/png;base64,aGk=");
  });
});
