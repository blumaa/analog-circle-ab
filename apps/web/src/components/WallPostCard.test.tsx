import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { WallPostCard } from "./WallPostCard";
import type { WallPostCardReply } from "./WallPostCard";

const AUTHOR = { name: "David", photoUrl: null };
const TIMESTAMP = "2026-06-10T10:00:00.000Z";
const BODY = "Great hosting last month!";

function renderCard(props: Partial<React.ComponentProps<typeof WallPostCard>> = {}) {
  return render(
    <MemoryRouter>
      <WallPostCard author={AUTHOR} timestamp={TIMESTAMP} {...props}>
        {BODY}
      </WallPostCard>
    </MemoryRouter>,
  );
}

const sampleReplies: WallPostCardReply[] = [
  { author: "Vki", body: "Seconded!", timestamp: "2026-06-10T11:00:00.000Z" },
];

describe("WallPostCard — rendering", () => {
  it("renders the body content", () => {
    renderCard();
    expect(screen.getByText(BODY)).toBeInTheDocument();
  });

  it("links the body to href when provided", () => {
    renderCard({ href: "/innercircle/event/meeting-0" });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/innercircle/event/meeting-0");
    expect(link).toHaveTextContent(BODY);
  });

  it("renders no link when href is omitted", () => {
    renderCard();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the author name", () => {
    renderCard();
    expect(screen.getByText("David")).toBeInTheDocument();
  });

  it("renders a relative timestamp", () => {
    renderCard();
    // relativeTime will produce some non-empty string for any ISO date
    const ts = screen.getByText(/ago|just now/);
    expect(ts).toBeInTheDocument();
  });
});

describe("WallPostCard — scope badge", () => {
  it("shows Inner badge when scope is inner", () => {
    renderCard({ scope: "inner" });
    expect(screen.getByText("Inner")).toBeInTheDocument();
  });

  it("does not show Inner badge when scope is analog", () => {
    renderCard({ scope: "analog" });
    expect(screen.queryByText("Inner")).not.toBeInTheDocument();
  });

  it("does not show Inner badge when scope is omitted", () => {
    renderCard();
    expect(screen.queryByText("Inner")).not.toBeInTheDocument();
  });
});

describe("WallPostCard — heart / likes", () => {
  it("shows the heart button when likes prop is provided", () => {
    renderCard({
      likes: { count: 2, likerNames: ["Vki", "Kasey"], hasLiked: false, onToggle: vi.fn() },
    });
    expect(screen.getByRole("button", { name: "Like" })).toBeInTheDocument();
  });

  it("does not show the heart when likes prop is omitted", () => {
    renderCard();
    expect(screen.queryByRole("button", { name: /like/i })).not.toBeInTheDocument();
  });

  it("shows Unlike when hasLiked is true", () => {
    renderCard({
      likes: { count: 1, likerNames: ["David"], hasLiked: true, onToggle: vi.fn() },
    });
    expect(screen.getByRole("button", { name: "Unlike" })).toBeInTheDocument();
  });

  it("calls onToggle when heart button is clicked", async () => {
    const onToggle = vi.fn();
    renderCard({
      likes: { count: 0, likerNames: [], hasLiked: false, onToggle },
    });
    await userEvent.click(screen.getByRole("button", { name: "Like" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("disables the heart button when onToggle is not provided", () => {
    renderCard({
      likes: { count: 0, likerNames: [], hasLiked: false },
    });
    expect(screen.getByRole("button", { name: "Like" })).toBeDisabled();
  });
});

describe("WallPostCard — replies", () => {
  it("does not show reply section when replies prop is omitted", () => {
    renderCard();
    expect(screen.queryByRole("button", { name: /repl/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Replies")).not.toBeInTheDocument();
  });

  it("shows reply count toggle when items are present", () => {
    renderCard({ replies: { items: sampleReplies } });
    expect(screen.getByRole("button", { name: /1 reply/i })).toBeInTheDocument();
  });

  it("expands reply list when toggle is clicked", async () => {
    renderCard({ replies: { items: sampleReplies } });
    await userEvent.click(screen.getByRole("button", { name: /1 reply/i }));
    expect(screen.getByText("Seconded!")).toBeInTheDocument();
    expect(screen.getByText("Vki")).toBeInTheDocument();
  });

  it("collapses reply list when toggle is clicked again", async () => {
    renderCard({ replies: { items: sampleReplies } });
    const toggle = screen.getByRole("button", { name: /1 reply/i });
    await userEvent.click(toggle);
    await userEvent.click(screen.getByRole("button", { name: /hide replies/i }));
    expect(screen.queryByText("Seconded!")).not.toBeInTheDocument();
  });

  it("does not show reply composer when canReply is false", () => {
    renderCard({ replies: { items: [], canReply: false } });
    expect(screen.queryByLabelText("Reply body")).not.toBeInTheDocument();
  });

  it("shows reply composer when canReply is true", () => {
    renderCard({ replies: { items: [], canReply: true, onReply: vi.fn() } });
    expect(screen.getByLabelText("Reply body")).toBeInTheDocument();
  });

  it("calls onReply with the trimmed text and clears the textarea", async () => {
    const onReply = vi.fn();
    renderCard({ replies: { items: [], canReply: true, onReply } });
    await userEvent.type(screen.getByLabelText("Reply body"), "Nice post!");
    await userEvent.click(screen.getByRole("button", { name: "Reply" }));
    expect(onReply).toHaveBeenCalledWith("Nice post!");
    expect(screen.getByLabelText("Reply body")).toHaveValue("");
  });

  it("disables the Reply button when textarea is empty", () => {
    renderCard({ replies: { items: [], canReply: true, onReply: vi.fn() } });
    expect(screen.getByRole("button", { name: "Reply" })).toBeDisabled();
  });
});

describe("WallPostCard — delete", () => {
  it("shows delete button when onDelete is provided", () => {
    renderCard({ onDelete: vi.fn() });
    expect(screen.getByRole("button", { name: "Delete post" })).toBeInTheDocument();
  });

  it("does not show delete button when onDelete is omitted", () => {
    renderCard();
    expect(screen.queryByRole("button", { name: "Delete post" })).not.toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const onDelete = vi.fn();
    renderCard({ onDelete });
    await userEvent.click(screen.getByRole("button", { name: "Delete post" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});

describe("WallPostCard — activity mode (no likes / replies / delete)", () => {
  it("renders cleanly with only required props", () => {
    renderCard();
    expect(screen.getByText(BODY)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /like/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete post" })).not.toBeInTheDocument();
  });

  it("passes axe accessibility check in activity mode", async () => {
    const { container } = renderCard();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("passes axe accessibility check in full mode (likes + replies + delete)", async () => {
    const { container } = renderCard({
      scope: "inner",
      likes: { count: 1, likerNames: ["Vki"], hasLiked: false, onToggle: vi.fn() },
      replies: { items: sampleReplies, canReply: true, onReply: vi.fn() },
      onDelete: vi.fn(),
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
