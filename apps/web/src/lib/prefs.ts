import type { NotificationKey, Prefs } from "../data/types";

export const DEFAULT_NOTIFICATIONS: Record<NotificationKey, boolean> = {
  dinnerReminders: true,
  dinnerFeedback: true,
  newExperience: true,
  experienceReminders: false,
  experienceComments: true,
  commentReplies: true,
  experienceFeedback: true,
  createdExperienceActivity: true,
  newLoopPost: false,
};

export function defaultPrefs(memberId: string): Prefs {
  return {
    memberId,
    channel: "push",
    notifications: { ...DEFAULT_NOTIFICATIONS },
    favouritePostIds: [],
  };
}

/** Returns list with id toggled. */
export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}
