import type { Post, RsvpStatus } from "../../data/types";
import { formatEventWhen } from "../../lib/dates";
import { ConfirmSheet } from "../../components/ConfirmSheet";

export interface RsvpConfirmSheetProps {
  post: Post;
  /** The answer awaiting confirmation. Closed when null. */
  pending: RsvpStatus | null;
  onConfirm: (status: RsvpStatus) => void;
  onClose: () => void;
}

/** Asks before joining or leaving an event's going list. */
export function RsvpConfirmSheet({ post, pending, onConfirm, onClose }: RsvpConfirmSheetProps) {
  const joining = pending === "going";
  return (
    <ConfirmSheet
      open={pending !== null}
      title={joining ? `Going to ${post.title}?` : `Leave ${post.title}?`}
      confirmLabel={joining ? "I'm going" : "Leave event"}
      tone={joining ? "primary" : "danger"}
      onClose={onClose}
      onConfirm={() => {
        if (pending) onConfirm(pending);
        onClose();
      }}
    >
      {joining
        ? post.event && formatEventWhen(post.event)
        : "You'll be taken off the going list. You can RSVP again any time."}
    </ConfirmSheet>
  );
}
