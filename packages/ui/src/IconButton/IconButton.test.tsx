import type { AnchorHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Bookmark } from "lucide-react";
import { IconButton, IconLink } from "./IconButton";

describe("IconButton", () => {
  it("is a button named by its label", () => {
    render(<IconButton label="Save" icon={<Bookmark />} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<IconButton label="Save" icon={<Bookmark />} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("exposes pressed state when given", () => {
    render(<IconButton label="Save" icon={<Bookmark />} pressed />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("omits aria-pressed when not a toggle", () => {
    render(<IconButton label="Save" icon={<Bookmark />} />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-pressed");
  });

  it("applies variant, size and shape", () => {
    render(<IconButton label="Delete" icon={<Bookmark />} variant="danger" size={32} shape="square" />);
    const b = screen.getByRole("button");
    expect(b).toHaveAttribute("data-variant", "danger");
    expect(b).toHaveAttribute("data-size", "32");
    expect(b).toHaveAttribute("data-shape", "square");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<IconButton label="Save" icon={<Bookmark />} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders through a custom link component", () => {
    const RouterLink = ({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={`#${to}`} data-router="yes" {...rest} />
    );
    render(<IconLink as={RouterLink} to="/settings" label="Settings" icon={<Bookmark />} />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "#/settings");
    expect(link).toHaveAttribute("data-router", "yes");
  });
});

describe("IconLink", () => {
  it("is a link named by its label with the button look", async () => {
    const { container } = render(<IconLink label="Email Ada" icon={<Bookmark />} href="mailto:ada@example.com" size={30} />);
    const link = screen.getByRole("link", { name: "Email Ada" });
    expect(link).toHaveAttribute("href", "mailto:ada@example.com");
    expect(link).toHaveAttribute("data-variant", "chip");
    expect(link).toHaveAttribute("data-size", "30");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders through a custom link component", () => {
    const RouterLink = ({ to, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a href={`#${to}`} data-router="yes" {...rest} />
    );
    render(<IconLink as={RouterLink} to="/settings" label="Settings" icon={<Bookmark />} />);
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveAttribute("href", "#/settings");
    expect(link).toHaveAttribute("data-router", "yes");
  });
});
