import { useState } from "react";
import { SmilePlus } from "lucide-react";
import { ReactionPill } from "@analog/ui";
import type { Reactions } from "../../data/types";
import { reactionSummary } from "../../lib/reactions";
import { EmojiPicker } from "./EmojiPicker";
import styles from "./ReactionRow.module.css";

export interface ReactionRowProps {
  reactions: Reactions;
  viewerId: string;
  onToggle: (emoji: string) => void;
  /** 22 under comments, 30 on detail pages. */
  size?: 22 | 30;
  children?: React.ReactNode;
}

/** One pill per emoji plus an add button that opens the picker. Extra actions go in children. */
export function ReactionRow({ reactions, viewerId, onToggle, size = 22, children }: ReactionRowProps) {
  const [picking, setPicking] = useState(false);
  const summary = reactionSummary(reactions, viewerId);
  const mine = new Set(summary.filter((r) => r.mine).map((r) => r.emoji));
  const pick = (emoji: string) => {
    onToggle(emoji);
    setPicking(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.row} data-size={size}>
        {summary.map((r) => (
          <ReactionPill
            key={r.emoji}
            size={size}
            active={r.mine}
            aria-label={`${r.emoji} ${r.count}${r.mine ? ", remove yours" : ", add yours"}`}
            onClick={() => onToggle(r.emoji)}
          >
            {r.emoji} {r.count}
          </ReactionPill>
        ))}
        <button
          type="button"
          className={styles.add}
          aria-label="Add reaction"
          aria-expanded={picking}
          onClick={() => setPicking((p) => !p)}
        >
          <SmilePlus size={size === 22 ? 12 : 15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        {children}
      </div>
      {picking && <EmojiPicker mine={mine} onPick={pick} />}
    </div>
  );
}
