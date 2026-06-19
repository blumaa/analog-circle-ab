import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../test/renderWithProviders";
import { ShareButton } from "./ShareButton";

describe("ShareButton", () => {
  const originalShare = navigator.share;

  beforeEach(() => {
    // Force the clipboard fallback path by removing the Web Share API.
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "share", { value: originalShare, configurable: true });
    vi.restoreAllMocks();
  });

  it("copies the URL to the clipboard and shows a toast when navigator.share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderWithProviders(<ShareButton title="Inner Circle meeting" />);

    await userEvent.click(screen.getByRole("button", { name: /share/i }));

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await waitFor(() => {
      expect(screen.getByText("Link copied.")).toBeInTheDocument();
    });
  });
});
