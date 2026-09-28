import { afterEach, describe, expect, it, vi } from "vitest";
import { shareLink } from "./share";

afterEach(() => vi.unstubAllGlobals());

describe("shareLink", () => {
  it("uses the native share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });
    await expect(shareLink({ title: "T", url: "https://x/e" })).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({ title: "T", url: "https://x/e" });
  });

  it("copies the link otherwise", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await expect(shareLink({ title: "T", url: "https://x/e" })).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://x/e");
  });

  it("reports a cancelled share sheet", async () => {
    vi.stubGlobal("navigator", { share: vi.fn().mockRejectedValue(new DOMException("x", "AbortError")) });
    await expect(shareLink({ title: "T", url: "u" })).resolves.toBe("cancelled");
  });
});
