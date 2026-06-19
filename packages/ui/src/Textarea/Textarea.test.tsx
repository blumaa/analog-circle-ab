import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a textbox", () => {
    render(<Textarea aria-label="Bio" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("forwards value and placeholder props", () => {
    render(<Textarea aria-label="Bio" value="hello" readOnly placeholder="Tell us…" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("hello");
    expect(textarea).toHaveAttribute("placeholder", "Tell us…");
  });

  it("calls onChange when the user types", async () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Bio" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("defaults to vertical resize", () => {
    render(<Textarea aria-label="Bio" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-resize", "vertical");
  });

  it("applies resize=none when requested", () => {
    render(<Textarea aria-label="Bio" resize="none" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-resize", "none");
  });

  it("applies the rows prop", () => {
    render(<Textarea aria-label="Bio" rows={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });

  it("forwards the ref to the textarea element", () => {
    const ref = { current: null as HTMLTextAreaElement | null };
    render(<Textarea aria-label="Bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("renders a label element when label prop is provided", () => {
    render(<Textarea label="Biography" />);
    expect(screen.getByText("Biography").tagName).toBe("LABEL");
  });

  it("associates the label with the textarea via htmlFor/id", () => {
    render(<Textarea label="Biography" />);
    const label = screen.getByText("Biography");
    const textarea = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", textarea.id);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Textarea aria-label="Biography" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with label", async () => {
    const { container } = render(<Textarea label="Biography" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
