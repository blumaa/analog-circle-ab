import { useCallback } from "react";
import { useCircles, useMe, useMembers, usePrefs, useRsvps } from "../../data/hooks";
import type { FeedContext } from "../../lib/feed";

/** Viewer, circles, favourites and RSVPs for feed selection. Null until loaded. */
export function useFeedContext(): { ctx: FeedContext | null; authorName: (id: string) => string } {
  const { me } = useMe();
  const { data: members = [] } = useMembers();
  const { data: circles } = useCircles();
  const { data: prefs } = usePrefs(me?.id);
  const { data: rsvps } = useRsvps();
  const authorName = useCallback((id: string) => members.find((m) => m.id === id)?.name ?? "", [members]);
  const ctx = me && circles && prefs && rsvps ? { viewerId: me.id, circles, prefs, rsvps } : null;
  return { ctx, authorName };
}
