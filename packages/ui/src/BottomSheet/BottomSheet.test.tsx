import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet", () => {
  it("renders nothing when closed", () => {
    render(<BottomSheet open={false} onClose={() => {}} title="Filters">x</BottomSheet>);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a labelled dialog when open", () => {
    render(<BottomSheet open onClose={() => {}} title="Filters">body</BottomSheet>);
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("uses ariaLabel when no visible title", () => {
    render(<BottomSheet open onClose={() => {}} ariaLabel="Menu">body</BottomSheet>);
    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("renders header action", () => {
    render(<BottomSheet open onClose={() => {}} title="Filters" action={<button type="button">Reset</button>}>b</BottomSheet>);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<BottomSheet open onClose={onClose} title="Filters">b</BottomSheet>);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on overlay click, not on sheet click", async () => {
    const onClose = vi.fn();
    render(<BottomSheet open onClose={onClose} title="Filters">b</BottomSheet>);
    await userEvent.click(screen.getByText("b"));
    expect(onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId("sheet-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    render(<BottomSheet open onClose={() => {}} title="Filters">b</BottomSheet>);
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
