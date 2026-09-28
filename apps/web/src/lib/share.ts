export type ShareResult = "shared" | "copied" | "cancelled";

/** Native share sheet where available (phones), else copies the URL. */
export async function shareLink(data: { title: string; url: string }): Promise<ShareResult> {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (e) {
      // The user closing the share sheet rejects with AbortError; anything else is a real failure.
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
      throw e;
    }
  }
  await navigator.clipboard.writeText(data.url);
  return "copied";
}
