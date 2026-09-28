import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { dataSource } from "../../data";
import { renderWithProviders } from "../../test/renderWithProviders";
import { EditPostPage, NewPostPage } from "./PostFormPage";

const renderNew = (search = "") => renderWithProviders(<NewPostPage />, { path: "/new", initialEntries: [`/new${search}`] });
const renderEdit = (id: string) =>
  renderWithProviders(<EditPostPage />, { path: "/posts/:id/edit", initialEntries: [`/posts/${id}/edit`] });

const publishTo = () => screen.getByRole("group", { name: "Publish to" });
const latestPost = async () => (await dataSource.listPosts()).find((p) => p.title === "Tea tasting");

describe("NewPostPage", () => {
  it("creates an event for My Circle and The Square by default", async () => {
    const user = userEvent.setup();
    const { container } = renderNew();
    expect(await screen.findByRole("heading", { level: 1, name: "New" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Event" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "My Circle" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "The Square" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "The Loop" })).not.toBeChecked();
    expect(await axe(container)).toHaveNoViolations();

    await user.type(screen.getByLabelText("Title"), "Tea tasting");
    await user.type(screen.getByLabelText("Description"), "Five oolongs.");
    await user.type(screen.getByLabelText("Date"), "2026-10-20");
    await user.type(screen.getByLabelText("Start time"), "18:30");
    await user.type(screen.getByLabelText("Where"), "My place");
    await user.type(screen.getByLabelText("Guest limit?"), "6");
    await user.click(screen.getByRole("switch", { name: "Address visible?" }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
    expect(await latestPost()).toMatchObject({
      type: "event",
      authorId: "aaron",
      body: "Five oolongs.",
      publishedTo: ["ic4", "square"],
      event: { date: "2026-10-20", startTime: "18:30", endTime: null, address: "My place", addressVisible: true, canBringFriend: true, guestLimit: 6 },
    });
  });

  it("shows what's missing instead of creating", async () => {
    const user = userEvent.setup();
    renderNew();
    await screen.findByRole("heading", { level: 1, name: "New" });
    await user.click(within(publishTo()).getByRole("checkbox", { name: "My Circle" }));
    await user.click(within(publishTo()).getByRole("checkbox", { name: "The Square" }));
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByText("Give it a name.")).toBeInTheDocument();
    expect(screen.getByText("Pick at least one place to publish.")).toBeInTheDocument();
    expect(screen.getByText("Pick a date.")).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Navigated away")).not.toBeInTheDocument();
  });

  it("hides date fields when the group picks, and event fields for posts", async () => {
    const user = userEvent.setup();
    renderNew();
    await screen.findByRole("heading", { level: 1, name: "New" });
    await user.click(screen.getByRole("button", { name: "Let the group pick" }));
    expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Where")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Post" }));
    expect(screen.queryByLabelText("Where")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Let the group pick" })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Title"), "Tea tasting");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
    expect(await latestPost()).toMatchObject({ type: "post", event: null });
  });

  it("preselects the circle it was opened from", async () => {
    renderNew("?circle=creative-corner");
    await screen.findByRole("heading", { level: 1, name: "New" });
    expect(within(publishTo()).getByRole("checkbox", { name: "Creative Corner" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "My Circle" })).not.toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "The Square" })).not.toBeChecked();
  });

  it("ignores a circle the author is not in", async () => {
    renderNew("?circle=book-club");
    await screen.findByRole("heading", { level: 1, name: "New" });
    expect(within(publishTo()).getByRole("checkbox", { name: "My Circle" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "The Square" })).toBeChecked();
    expect(within(publishTo()).getByRole("checkbox", { name: "Other circle" })).not.toBeChecked();
  });

  it("picks other circles from a sheet", async () => {
    const user = userEvent.setup();
    renderNew();
    await screen.findByRole("heading", { level: 1, name: "New" });
    await user.click(within(publishTo()).getByRole("checkbox", { name: "Other circle" }));
    const sheet = await screen.findByRole("dialog", { name: "Other circles" });
    expect(within(sheet).queryByRole("checkbox", { name: /IC4/ })).not.toBeInTheDocument();
    await user.click(within(sheet).getByRole("checkbox", { name: "Padel Crew" }));
    await user.click(within(sheet).getByRole("checkbox", { name: "Creative Corner" }));
    await user.click(within(sheet).getByRole("button", { name: "Done" }));
    expect(within(publishTo()).getByRole("checkbox", { name: "2 circles" })).toBeChecked();
  });

  it("uploads a display pic and can remove it", async () => {
    const user = userEvent.setup();
    renderNew();
    await screen.findByRole("heading", { level: 1, name: "New" });
    await user.upload(screen.getByLabelText("Display pic"), new File(["hi"], "pic.png", { type: "image/png" }));
    expect(await screen.findByRole("img", { name: "Display pic preview" })).toHaveAttribute("src", "data:image/png;base64,aGk=");
    await user.click(screen.getByRole("button", { name: "Remove picture" }));
    expect(screen.queryByRole("img", { name: "Display pic preview" })).not.toBeInTheDocument();
  });

  it("clears the form and cancels", async () => {
    const user = userEvent.setup();
    renderNew();
    await screen.findByRole("heading", { level: 1, name: "New" });
    await user.type(screen.getByLabelText("Title"), "Tea tasting");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByLabelText("Title")).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Navigated away")).toBeInTheDocument();
  });
});

describe("EditPostPage", () => {
  it("edits the author's own post", async () => {
    const user = userEvent.setup();
    renderEdit("padel-doubles");
    expect(await screen.findByRole("heading", { level: 1, name: "Edit post" })).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: "Type" })).not.toBeInTheDocument();
    expect(within(publishTo()).getByRole("checkbox", { name: "Padel Crew" })).toBeChecked();
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Tea tasting");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Navigated away")).toBeInTheDocument();
    expect(await latestPost()).toMatchObject({ id: "padel-doubles", publishedTo: ["padel"] });
  });

  it("refuses posts the viewer didn't write", async () => {
    renderEdit("zine-night");
    expect(await screen.findByText("You can only edit your own posts.")).toBeInTheDocument();
  });

  it("handles unknown posts", async () => {
    renderEdit("nope");
    expect(await screen.findByText("Post not found.")).toBeInTheDocument();
  });
});
