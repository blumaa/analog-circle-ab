import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Email sign-in link</Button>);
    expect(screen.getByRole("button", { name: "Email sign-in link" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies the variant as a data attribute", () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "danger",
    );
  });

  it("iconOnly renders an accessible icon button via aria-label", () => {
    render(
      <Button iconOnly aria-label="Open menu" variant="outline">
        ☰
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Open menu" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("data-icon-only");
  });

  it("forwards ref to the underlying button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("applies the whatsapp variant as a data attribute", () => {
    render(<Button variant="whatsapp">WhatsApp</Button>);
    expect(screen.getByRole("button", { name: "WhatsApp" })).toHaveAttribute(
      "data-variant",
      "whatsapp",
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Accessible</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations for iconOnly", async () => {
    const { container } = render(
      <Button iconOnly aria-label="Close" variant="ghost">
        ✕
      </Button>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations for whatsapp variant", async () => {
    const { container } = render(<Button variant="whatsapp">Join WhatsApp</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("applies the outline variant as a data attribute", () => {
    render(<Button variant="outline">Add to The Loop</Button>);
    expect(screen.getByRole("button", { name: "Add to The Loop" })).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });

  it("applies the soft variant as a data attribute", () => {
    render(<Button variant="soft">Download .ics</Button>);
    expect(screen.getByRole("button", { name: "Download .ics" })).toHaveAttribute(
      "data-variant",
      "soft",
    );
  });

  it("has no accessibility violations for outline variant", async () => {
    const { container } = render(<Button variant="outline">Add to The Loop</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations for soft variant", async () => {
    const { container } = render(<Button variant="soft">Download .ics</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defaults to pill=true (no data-pill attribute)", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button", { name: "Default" });
    expect(btn).not.toHaveAttribute("data-pill");
  });

  it("sets data-pill=false when pill={false}", () => {
    render(<Button pill={false}>Sign out</Button>);
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveAttribute("data-pill", "false");
  });

  it("has no accessibility violations for pill=false", async () => {
    const { container } = render(<Button pill={false}>Sign out</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
