import { Share2 } from "lucide-react";
import { Button, useToast } from "@analog/ui";

export interface ShareButtonProps {
  /** Title used by the native share sheet (e.g. the event title). */
  title: string;
}

/** True when the user dismissed the native share sheet (not a real error). */
function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/**
 * Share control: uses the Web Share API when available, otherwise copies the
 * current URL to the clipboard. User-cancelled shares never surface an error.
 */
export function ShareButton({ title }: ShareButtonProps) {
  const toast = useToast();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        toast.success("Shared.");
      } catch (err) {
        if (!isAbortError(err)) toast.error("Couldn't share this event.");
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 aria-hidden size={16} />
      Share
    </Button>
  );
}
