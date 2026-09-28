import { useState, type FormEvent } from "react";
import { BottomSheet, Button, Textarea, useToast } from "@analog/ui";
import { useMe, useSendFeedback } from "../data/hooks";
import styles from "./FeedbackSheet.module.css";

export interface FeedbackSheetProps {
  open: boolean;
  onClose: () => void;
}

/** Sends a note to the admins' feedback table. Mounts fresh each open so the text resets. */
export function FeedbackSheet(props: FeedbackSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} title="Give feedback">
      {props.open && <FeedbackForm {...props} />}
    </BottomSheet>
  );
}

function FeedbackForm({ onClose }: FeedbackSheetProps) {
  const { me } = useMe();
  const send = useSendFeedback();
  const toast = useToast();
  const [body, setBody] = useState("");
  const valid = body.trim() !== "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!me || !valid) return;
    try {
      await send.mutateAsync({ authorId: me.id, body });
      toast.success("Thanks for the feedback");
      onClose();
    } catch {
      toast.error("Couldn't send your feedback. Try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Textarea
        label="Your feedback"
        rows={5}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What works, what doesn't, what you'd like to see"
      />
      <Button type="submit" size="lg" fullWidth disabled={!valid || send.isPending}>
        Send
      </Button>
    </form>
  );
}
