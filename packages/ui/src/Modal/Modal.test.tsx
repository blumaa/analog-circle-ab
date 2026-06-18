import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => undefined} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog when open", () => {
    render(
      <Modal open onClose={() => undefined} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Propose hosting swap");
    expect(screen.getByText("Body")).toBeVisible();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on overlay click", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByTestId("modal-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close when the panel itself is clicked", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByText("Body"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes via the close button", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders footer content", () => {
    render(
      <Modal
        open
        onClose={() => undefined}
        title="Propose hosting swap"
        footer={<button type="button">Send</button>}
      >
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { baseElement } = render(
      <Modal open onClose={() => undefined} title="Propose hosting swap">
        <p>Body</p>
      </Modal>,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
