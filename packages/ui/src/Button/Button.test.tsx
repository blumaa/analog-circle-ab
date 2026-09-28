import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button, ButtonLink } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Create</Button>);
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Create</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Create
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to primary md", () => {
    render(<Button>Create</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "primary");
    expect(btn).toHaveAttribute("data-size", "md");
  });

  it.each(["secondary", "outline", "tint", "danger"] as const)("applies %s variant", (variant) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant);
  });

  it("applies lg size and full width", () => {
    render(
      <Button size="lg" fullWidth>
        Apply
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-size", "lg");
    expect(btn).toHaveAttribute("data-full-width", "true");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Go</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button leftIcon={<span>+</span>}>New circle</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ButtonLink", () => {
  it("renders a link with the button look", async () => {
    const { container } = render(
      <ButtonLink href="/members/ada" variant="tint" size="sm">
        More details
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "More details" });
    expect(link).toHaveAttribute("href", "/members/ada");
    expect(link).toHaveAttribute("data-variant", "tint");
    expect(link).toHaveAttribute("data-size", "sm");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a custom link component", () => {
    const Custom = ({ to, ...rest }: { to: string; children?: React.ReactNode; className?: string }) => <a href={to} {...rest} />;
    render(
      <ButtonLink as={Custom} to="/x">
        Go
      </ButtonLink>,
    );
    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/x");
  });
});
