import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a textbox", () => {
    render(<Input aria-label="Title" />);
    expect(screen.getByRole("textbox", { name: "Title" })).toBeInTheDocument();
  });

  it("forwards placeholder and type", () => {
    render(<Input aria-label="Email" type="email" placeholder="you@example.com" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("placeholder", "you@example.com");
  });

  it("calls onChange when the user types", async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Title" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(onChange).toHaveBeenCalled();
  });

  it("marks icon slots", () => {
    render(<Input aria-label="Where" leftIcon={<span>L</span>} rightIcon={<span>R</span>} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("data-has-left-icon", "true");
    expect(input).toHaveAttribute("data-has-right-icon", "true");
  });

  it("associates the label with the input", () => {
    render(<Input label="Title" />);
    expect(screen.getByLabelText("Title")).toBe(screen.getByRole("textbox"));
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Title" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Input label="Title" rightIcon={<span>R</span>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
  it("describes an error and marks the field invalid", () => {
    render(<Input label="Title" error="Give it a name." />);
    const input = screen.getByLabelText("Title");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Give it a name.");
  });

  it("is valid without an error", () => {
    render(<Input label="Title" />);
    expect(screen.getByLabelText("Title")).not.toHaveAttribute("aria-invalid");
  });
});
