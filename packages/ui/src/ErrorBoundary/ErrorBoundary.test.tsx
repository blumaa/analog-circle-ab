import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom({ message = "kaboom" }: { message?: string }): never {
  throw new Error(message);
}

describe("ErrorBoundary", () => {
  // React logs caught errors to console.error; silence it for these tests.
  let spy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    spy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => spy.mockRestore());

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("renders the default fallback with the error message on error", () => {
    render(
      <ErrorBoundary>
        <Boom message="explode" />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("explode")).toBeInTheDocument();
  });

  it("calls onError when an error is caught", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("renders a custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={(error) => <div>custom: {error.message}</div>}>
        <Boom message="nope" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("custom: nope")).toBeInTheDocument();
  });

  it("recovers when the user clicks Try again and children no longer throw", async () => {
    const user = userEvent.setup();
    function Flaky({ shouldThrow }: { shouldThrow: boolean }) {
      if (shouldThrow) throw new Error("flaky");
      return <p>recovered</p>;
    }
    const { rerender } = render(
      <ErrorBoundary>
        <Flaky shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(
      <ErrorBoundary>
        <Flaky shouldThrow={false} />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("recovered")).toBeInTheDocument();
  });

  it("has no axe violations in the fallback state", async () => {
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
