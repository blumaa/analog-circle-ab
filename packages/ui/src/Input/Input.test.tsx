import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Search } from "lucide-react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders a textbox", () => {
    render(<Input aria-label="Search" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards placeholder and type props", () => {
    render(<Input aria-label="Email" placeholder="you@example.com" type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "you@example.com");
    expect(input).toHaveAttribute("type", "email");
  });

  it("calls onChange when the user types", async () => {
    const onChange = vi.fn();
    render(<Input aria-label="Search" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders leftIcon when provided", () => {
    render(<Input aria-label="Search" leftIcon={<Search data-testid="icon" size={16} />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Input aria-label="Search query" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with leftIcon", async () => {
    const { container } = render(
      <Input aria-label="Search query" leftIcon={<Search size={16} />} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders a label element when label prop is provided", () => {
    render(<Input label="Search query" />);
    expect(screen.getByText("Search query").tagName).toBe("LABEL");
  });

  it("associates the label with the input via htmlFor/id", () => {
    render(<Input label="Email address" />);
    const label = screen.getByText("Email address");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("has no accessibility violations with label", async () => {
    const { container } = render(<Input label="Email address" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
