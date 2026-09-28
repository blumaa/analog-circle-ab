import { ReactionPill } from "@analog/ui";
import { QUICK_REACTIONS } from "../../lib/reactions";
import styles from "./EmojiPicker.module.css";

export interface EmojiPickerProps {
  /** Emoji the viewer has already added. */
  mine: ReadonlySet<string>;
  onPick: (emoji: string) => void;
}

export function EmojiPicker({ mine, onPick }: EmojiPickerProps) {
  return (
    <div role="group" aria-label="Pick a reaction" className={styles.picker}>
      {QUICK_REACTIONS.map((emoji) => (
        <ReactionPill key={emoji} size={30} active={mine.has(emoji)} onClick={() => onPick(emoji)}>
          {emoji}
        </ReactionPill>
      ))}
    </div>
  );
}
