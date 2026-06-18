import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { WallComposer } from "./WallComposer";

describe("WallComposer", () => {
  const onPost = vi.fn();
  const baseProps = {
    ownerId: "owner1",
    authorId: "viewer1",
    onPost,
  };

  it("shows scope toggle when canPostInner is true", () => {
    renderWithProviders(<WallComposer {...baseProps} canPostInner={true} />);
    expect(screen.getByRole("group", { name: /post visibility/i })).toBeInTheDocument();
  });

  it("hides scope toggle when canPostInner is false", () => {
    renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
    expect(screen.queryByRole("group", { name: /post visibility/i })).not.toBeInTheDocument();
  });

  it("calls onPost with scope=analog when canPostInner is false", async () => {
    renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
    await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "Hello");
    await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
    expect(onPost).toHaveBeenCalledWith(expect.objectContaining({ scope: "analog" }));
  });
});
