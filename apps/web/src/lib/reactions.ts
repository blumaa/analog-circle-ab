import type { Reactions } from "../data/types";

export interface ReactionCount {
  emoji: string;
  count: number;
  mine: boolean;
}

/** Returns new Reactions with memberId toggled on emoji. Empty emoji keys removed. */
export function toggleReaction(reactions: Reactions, emoji: string, memberId: string): Reactions {
  const current = reactions[emoji] ?? [];
  const next = current.includes(memberId)
    ? current.filter((id) => id !== memberId)
    : [...current, memberId];
  const { [emoji]: _dropped, ...rest } = reactions;
  return next.length ? { ...rest, [emoji]: next } : rest;
}

/** Emoji counts, highest first. */
export function reactionSummary(reactions: Reactions, viewerId: string | null): ReactionCount[] {
  return Object.entries(reactions)
    .map(([emoji, ids]) => ({ emoji, count: ids.length, mine: !!viewerId && ids.includes(viewerId) }))
    .filter((r) => r.count > 0)
    .toSorted((a, b) => b.count - a.count);
}

export function reactionTotal(reactions: Reactions): number {
  let total = 0;
  for (const ids of Object.values(reactions)) total += ids.length;
  return total;
}

/** Emoji offered by the reaction picker. */
export const QUICK_REACTIONS = ["🎉", "❤️", "😂", "👍", "🙌", "👏"] as const;
