import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { WallComposer } from "./WallComposer";
import type { Member } from "../data/types";

const makeMember = (id: string, name: string): Member => ({
  id,
  name,
  email: `${id}@example.com`,
  photoUrl: null,
  from: null,
  bio: null,
  interests: [],
  dietary: null,
  whatsappUrl: null,
  homeAddress: null,
  location: null,
});

const members: Member[] = [
  makeMember("david", "David"),
  makeMember("vki", "Vki"),
  makeMember("kasey", "Kasey"),
];

describe("WallComposer", () => {
  const onPost = vi.fn();
  const baseProps = {
    ownerId: "owner1",
    authorId: "author1",
    onPost,
    members,
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

  describe("@mention picker", () => {
    it("shows member options when '@' is typed", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@");
      // All members except the author should be shown.
      expect(screen.getByRole("listbox", { name: /tag a member/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "David" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Vki" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Kasey" })).toBeInTheDocument();
    });

    it("filters options by the text typed after '@'", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@Da");
      expect(screen.getByRole("option", { name: "David" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Vki" })).not.toBeInTheDocument();
    });

    it("closes the picker when Escape is pressed", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("selects a member via Enter and includes the id in onPost mentions", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "Hey @");
      // First option (David) is active by default.
      await userEvent.keyboard("{Enter}");
      // Picker should close.
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      // Textarea body should contain the inserted name.
      expect((textarea as HTMLTextAreaElement).value).toContain("@David");
      // Submit and verify mentions.
      await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
      expect(onPost).toHaveBeenCalledWith(
        expect.objectContaining({
          mentions: expect.arrayContaining(["david"]),
        }),
      );
    });

    it("selects a member via mouse click and includes the id in onPost mentions", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "Hello @");
      await userEvent.click(screen.getByRole("option", { name: "Vki" }));
      expect((textarea as HTMLTextAreaElement).value).toContain("@Vki");
      await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
      expect(onPost).toHaveBeenCalledWith(
        expect.objectContaining({
          mentions: expect.arrayContaining(["vki"]),
        }),
      );
    });

    it("does not include the author themselves in the picker", async () => {
      // Author is "david" — should not appear in the list.
      renderWithProviders(
        <WallComposer {...baseProps} authorId="david" canPostInner={false} />,
      );
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@");
      expect(screen.queryByRole("option", { name: "David" })).not.toBeInTheDocument();
    });

    it("passes mentions: [] when no members are tagged", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "Just a post");
      await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
      expect(onPost).toHaveBeenCalledWith(expect.objectContaining({ mentions: [] }));
    });

    it("resets the mentioned-ids set after submit", async () => {
      renderWithProviders(<WallComposer {...baseProps} canPostInner={false} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@");
      await userEvent.keyboard("{Enter}");
      await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
      // Second post: the textarea is cleared, so typing fresh should show no pre-selected ids.
      await userEvent.type(textarea, "Clean slate");
      await userEvent.click(screen.getByRole("button", { name: /^Post$/i }));
      expect(onPost).toHaveBeenLastCalledWith(expect.objectContaining({ mentions: [] }));
    });
  });
});
