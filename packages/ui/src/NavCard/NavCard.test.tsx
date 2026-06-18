import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Users } from "lucide-react";
import { NavCard } from "./NavCard";

describe("NavCard", () => {
  it("renders the title and description", () => {
    render(
      <NavCard
        icon={<Users />}
        title="Your Circle"
        description="Meetings, members, and map"
        href="/circle"
      />,
    );
    expect(screen.getByText("Your Circle")).toBeInTheDocument();
    expect(screen.getByText("Meetings, members, and map")).toBeInTheDocument();
  });

  it("renders as a link to href", () => {
    render(<NavCard icon={<Users />} title="Your Circle" href="/circle" />);
    expect(screen.getByRole("link", { name: /Your Circle/ })).toHaveAttribute(
      "href",
      "/circle",
    );
  });

  it("omits the description when not provided", () => {
    render(<NavCard icon={<Users />} title="Your Circle" href="/circle" />);
    expect(screen.getByText("Your Circle")).toBeInTheDocument();
  });

  it("calls onClick when activated", async () => {
    const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
    render(
      <NavCard icon={<Users />} title="Your Circle" href="/circle" onClick={onClick} />,
    );
    await userEvent.click(screen.getByRole("link", { name: /Your Circle/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <NavCard
        icon={<Users />}
        title="Your Circle"
        description="Meetings, members, and map"
        href="/circle"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
