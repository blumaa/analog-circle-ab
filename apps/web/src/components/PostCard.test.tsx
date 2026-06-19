import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { PostCard } from "./PostCard";
import type { LoopPost } from "../data";

const needPost: LoopPost = {
  id: "p1",
  scope: "analog",
  kind: "need",
  category: "Housing",
  body: "I need a room in Berlin",
  authorId: "u1",
  archived: false,
  createdAt: "2026-01-15T10:00:00Z",
  notes: [],
  helpedBy: [],
};

const offerPost: LoopPost = {
  ...needPost,
  id: "p2",
  kind: "offer",
  body: "Offering Spanish lessons",
  scope: "inner",
};

const resolveName = (id: string) => (id === "u1" ? "Alice" : id === "u2" ? "Bob" : id);

describe("PostCard", () => {
  it("renders NEED badge for a need post", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByText("NEED")).toBeInTheDocument();
  });

  it("uses rose badge variant for need posts", () => {
    const { container } = render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    const badge = container.querySelector("[data-variant='rose']");
    expect(badge).toBeInTheDocument();
  });

  it("uses accent badge variant for offer posts", () => {
    const { container } = render(
      <PostCard post={offerPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    const badge = container.querySelector("[data-variant='accent']");
    expect(badge).toBeInTheDocument();
  });

  it("sets data-kind=need on the card article for need posts", () => {
    const { container } = render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(container.querySelector("article")).toHaveAttribute("data-kind", "need");
  });

  it("sets data-kind=offer on the card article for offer posts", () => {
    const { container } = render(
      <PostCard post={offerPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(container.querySelector("article")).toHaveAttribute("data-kind", "offer");
  });

  it("has no accessibility violations (need post)", async () => {
    const { container } = render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations (offer post)", async () => {
    const { container } = render(
      <PostCard post={offerPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders OFFER badge for an offer post", () => {
    render(
      <PostCard post={offerPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByText("OFFER")).toBeInTheDocument();
  });

  it("renders the post body", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByText("I need a room in Berlin")).toBeInTheDocument();
  });

  it("shows an 'I can help' action on need posts", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /i can help/i })).toBeInTheDocument();
  });

  it("does not show 'I can help' on offer posts", () => {
    render(
      <PostCard post={offerPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.queryByRole("button", { name: /i can help/i })).not.toBeInTheDocument();
  });

  it("renders a WhatsApp link to the author when provided", () => {
    render(
      <PostCard
        post={offerPost}
        authorName="Alice"
        authorWhatsappUrl="https://wa.me/123"
        canArchive={false}
        onArchive={() => undefined}
      />,
    );
    expect(screen.getByRole("link", { name: /whatsapp alice/i })).toHaveAttribute(
      "href",
      "https://wa.me/123",
    );
  });

  it("shows archive button when canArchive is true", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={true} onArchive={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument();
  });

  it("does not show archive button when canArchive is false", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.queryByRole("button", { name: /archive/i })).not.toBeInTheDocument();
  });

  it("calls onArchive when archive button is clicked", async () => {
    const onArchive = vi.fn();
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={true} onArchive={onArchive} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /archive/i }));
    expect(onArchive).toHaveBeenCalledOnce();
  });

  it("shows the author name", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("shows the category", () => {
    render(
      <PostCard post={needPost} authorName="Alice" canArchive={false} onArchive={() => undefined} />,
    );
    expect(screen.getByText("Housing")).toBeInTheDocument();
  });

  describe("notes and helpedBy", () => {
    const postWithNote: LoopPost = {
      ...needPost,
      notes: [{ authorId: "u2", body: "I can help with the room search!" }],
      helpedBy: ["u2"],
    };

    it("renders note author label", () => {
      render(
        <PostCard
          post={postWithNote}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          resolveName={resolveName}
        />,
      );
      expect(screen.getByText("NOTE FROM BOB")).toBeInTheDocument();
    });

    it("renders note body", () => {
      render(
        <PostCard
          post={postWithNote}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          resolveName={resolveName}
        />,
      );
      expect(screen.getByText("I can help with the room search!")).toBeInTheDocument();
    });

    it("renders helpedBy line", () => {
      render(
        <PostCard
          post={postWithNote}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          resolveName={resolveName}
        />,
      );
      expect(screen.getByText("Helped by Bob")).toBeInTheDocument();
    });

    it("does not render helpedBy line when empty", () => {
      render(
        <PostCard
          post={needPost}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          resolveName={resolveName}
        />,
      );
      expect(screen.queryByText(/Helped by/)).not.toBeInTheDocument();
    });
  });

  describe("I can help composer", () => {
    it("opens the note composer when I can help is clicked", async () => {
      render(
        <PostCard
          post={needPost}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          currentMemberId="u2"
          onAddNote={() => undefined}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /i can help/i }));
      expect(screen.getByRole("textbox", { name: /help note/i })).toBeInTheDocument();
    });

    it("calls onAddNote with correct args when submitted", async () => {
      const onAddNote = vi.fn();
      render(
        <PostCard
          post={needPost}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          currentMemberId="u2"
          onAddNote={onAddNote}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /i can help/i }));
      await userEvent.type(screen.getByRole("textbox", { name: /help note/i }), "Happy to assist!");
      await userEvent.click(screen.getByRole("button", { name: /submit/i }));
      expect(onAddNote).toHaveBeenCalledWith("p1", "u2", "Happy to assist!");
    });

    it("disables submit when note body is empty", async () => {
      render(
        <PostCard
          post={needPost}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          currentMemberId="u2"
          onAddNote={() => undefined}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /i can help/i }));
      expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    });

    it("closes the composer on cancel", async () => {
      render(
        <PostCard
          post={needPost}
          authorName="Alice"
          canArchive={false}
          onArchive={() => undefined}
          currentMemberId="u2"
          onAddNote={() => undefined}
        />,
      );
      await userEvent.click(screen.getByRole("button", { name: /i can help/i }));
      expect(screen.getByRole("textbox", { name: /help note/i })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(screen.queryByRole("textbox", { name: /help note/i })).not.toBeInTheDocument();
    });
  });
});
