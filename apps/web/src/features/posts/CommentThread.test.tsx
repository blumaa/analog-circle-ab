import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { renderWithProviders } from "../../test/renderWithProviders";
import { dataSource } from "../../data";
import { CommentThread } from "./CommentThread";

const renderThread = (postId: string) => renderWithProviders(<CommentThread postId={postId} />);

describe("CommentThread", () => {
  it("lists comments with replies and passes axe", async () => {
    const { container } = renderThread("brunch-botanico");
    expect(await screen.findByText("Saving the seat by the lemon tree.")).toBeInTheDocument();
    expect(screen.getByText("It's yours. Bring the notebook.")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the empty state", async () => {
    renderThread("zine-night");
    expect(await screen.findByText("No comments yet. Say something nice.")).toBeInTheDocument();
  });

  it("adds a comment", async () => {
    const user = userEvent.setup();
    renderThread("zine-night");
    await user.type(await screen.findByRole("textbox", { name: "Write a comment" }), "Count me in");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Count me in")).toBeInTheDocument();
  });

  it("replies to a comment", async () => {
    const user = userEvent.setup();
    renderThread("welcome");
    await screen.findByText("Hi all! Vote: Albatross bakery.");
    await user.click(screen.getAllByRole("button", { name: "Reply" })[0]!);
    await user.type(screen.getByRole("textbox", { name: "Reply to Ines" }), "Albatross forever");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText("Albatross forever")).toBeInTheDocument();
    const saved = await dataSource.listComments("welcome");
    expect(saved.find((c) => c.body === "Albatross forever")?.parentId).toBe("c10");
  });

  it("edits the viewer's own comment", async () => {
    const user = userEvent.setup();
    renderThread("brunch-botanico");
    await screen.findByText("I'll be ten minutes late, padel runs over.");
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const input = screen.getByRole("textbox", { name: "Edit comment" });
    await user.clear(input);
    await user.type(input, "On time after all");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("On time after all")).toBeInTheDocument();
    expect(screen.getByText(/edited/)).toBeInTheDocument();
  });

  it("deletes a comment and its replies after confirming", async () => {
    const user = userEvent.setup();
    renderThread("brunch-botanico");
    await screen.findByText("Saving the seat by the lemon tree.");
    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]!);
    const dialog = screen.getByRole("dialog", { name: "Delete comment?" });
    expect(within(dialog).getByText("Its replies will be deleted too.")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Delete comment" }));
    expect(screen.queryByText("Saving the seat by the lemon tree.")).not.toBeInTheDocument();
    expect(screen.queryByText("It's yours. Bring the notebook.")).not.toBeInTheDocument();
  });

  it("toggles a reaction on a comment", async () => {
    const user = userEvent.setup();
    renderThread("brunch-botanico");
    const pill = await screen.findByRole("button", { name: "😂 2, remove yours" });
    await user.click(pill);
    expect(await screen.findByRole("button", { name: "😂 1, add yours" })).toBeInTheDocument();
  });
});
