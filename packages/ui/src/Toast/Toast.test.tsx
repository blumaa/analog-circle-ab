import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./ToastProvider";

describe("Toast", () => {
  it("renders the variant and message", () => {
    render(<Toast variant="success" message="Saved!" onDismiss={() => undefined} />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
    // success → polite live region
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for errors", () => {
    render(<Toast variant="error" message="Boom" onDismiss={() => undefined} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls onDismiss when the dismiss button is clicked", async () => {
    const onDismiss = vi.fn();
    render(<Toast variant="info" message="Heads up" onDismiss={onDismiss} />);
    await userEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { baseElement } = render(
      <Toast variant="success" message="Saved!" onDismiss={() => undefined} />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});

function Trigger() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast.success("Pushed")}>
      push
    </button>
  );
}

describe("ToastProvider / useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("pushes a toast and auto-dismisses it", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "push" }));
    expect(screen.getByText("Pushed")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.queryByText("Pushed")).not.toBeInTheDocument();
  });

  it("throws when used outside a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Trigger />)).toThrow(/within a ToastProvider/i);
    spy.mockRestore();
  });
});
