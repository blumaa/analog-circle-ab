import type { NotificationKey } from "../../data/types";

/** A toggle row. Rows without a key are always on and shown locked. */
export interface NotificationRow {
  label: string;
  key?: NotificationKey;
  note?: string;
}

export interface NotificationGroup {
  title: string;
  rows: NotificationRow[];
  /** Always on as a whole: the title carries a locked toggle. */
  locked?: boolean;
  note?: string;
}

/** Settings → Notifications, in display order. Copy comes from the current app. */
export const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    title: "Inner Circle dinners",
    rows: [
      { key: "dinnerReminders", label: "Reminders before the dinner" },
      { key: "dinnerFeedback", label: "Feedback afterwards" },
    ],
  },
  {
    title: "Experiences",
    rows: [
      { key: "newExperience", label: "Tell me when someone posts a new experience", note: "Personal invites still reach me." },
      { key: "experienceReminders", label: "Reminders before experiences I'm going to" },
      {
        key: "experienceComments",
        label: "Comments on experiences I'm going to",
        note: "Messages with @all reach me either way.",
      },
      { key: "commentReplies", label: "Replies to my comments" },
      { key: "experienceFeedback", label: "Feedback afterwards" },
      { key: "createdExperienceActivity", label: "RSVPs and comments on experiences I created" },
    ],
  },
  {
    title: "The Loop",
    rows: [
      { key: "newLoopPost", label: "Tell me when someone posts a new need or offer" },
      { label: "Replies to my posts", note: "Always on. Someone who replied is waiting to hear back." },
    ],
  },
  {
    title: "My catch-ups",
    rows: [],
    locked: true,
    note: "Always on. Share who I'm catching up with that month.",
  },
  {
    title: "From The Analog Circle",
    rows: [],
    locked: true,
    note: "Always on. Announcements and news about my membership.",
  },
];
