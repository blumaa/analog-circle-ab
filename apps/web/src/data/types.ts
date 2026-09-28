export type Role = "member" | "admin";

export interface Member {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  bio: string | null;
  phone: string | null;
  whatsappUrl: string | null;
  /** Profile URL (Instagram, LinkedIn, ...). */
  social: string | null;
  /** ISO date (YYYY-MM-DD). Year may be a placeholder; month + day drive the birthday post. */
  birthday: string | null;
  role: Role;
  /** ISO timestamp. */
  joinedAt: string;
  /** Opt-in to the automated birthday feed post. Public so every client can decide which birthday posts to create. */
  birthdayPost: boolean;
}

export type CircleType = "inner" | "interest" | "location";

export interface Circle {
  id: string;
  type: CircleType;
  name: string;
  description: string;
  /** Inner Circle number ("IC4"). Null for interest/location circles. */
  number: number | null;
  imageUrl: string | null;
  createdBy: string;
  createdAt: string;
  memberIds: string[];
}

/** Built-in feeds plus any circle id. */
export type PublishTarget = "square" | "loop" | (string & {});

/** event and post come from the New form; birthday is automated; offer/need are display-only. */
export type PostType = "event" | "post" | "birthday" | "offer" | "need";

export interface EventDetails {
  /** ISO date. Null when the group picks the date. */
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  address: string | null;
  addressVisible: boolean;
  canBringFriend: boolean;
  guestLimit: number | null;
}

/** emoji to member ids who reacted with it. */
export type Reactions = Record<string, string[]>;

export interface Post {
  id: string;
  type: PostType;
  title: string;
  body: string;
  imageUrl: string | null;
  authorId: string;
  publishedTo: PublishTarget[];
  createdAt: string;
  updatedAt: string | null;
  pinned: boolean;
  reactions: Reactions;
  commentCount: number;
  event: EventDetails | null;
  /** Birthday posts: who is celebrated. */
  celebrantId: string | null;
}

export type PostInput = Pick<
  Post,
  "type" | "title" | "body" | "imageUrl" | "authorId" | "publishedTo" | "event"
>;

export interface Comment {
  id: string;
  postId: string;
  /** Null for top-level comments. Replies never nest further. */
  parentId: string | null;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  reactions: Reactions;
}

export type RsvpStatus = "going" | "declined";

export interface Rsvp {
  postId: string;
  memberId: string;
  status: RsvpStatus;
  updatedAt: string;
}

export type NotificationChannel = "both" | "push" | "email";

export type NotificationKey =
  | "dinnerReminders"
  | "dinnerFeedback"
  | "newExperience"
  | "experienceReminders"
  | "experienceComments"
  | "commentReplies"
  | "experienceFeedback"
  | "createdExperienceActivity"
  | "newLoopPost";

/** Private to its member: nobody else may read or write it. */
export interface Prefs {
  memberId: string;
  channel: NotificationChannel;
  notifications: Record<NotificationKey, boolean>;
  favouritePostIds: string[];
}

/** A note a member sends from the menu. Only admins read it. */
export interface Feedback {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export type ActivityType = "post_created" | "comment" | "reply" | "member_joined";

/** A community activity record powering the notifications feed. */
export interface Activity {
  id: string;
  type: ActivityType;
  actorId: string;
  /** The member the activity is addressed to; null = everyone who can see the target. */
  subjectId: string | null;
  targetRoute: string;
  createdAt: string;
  readBy: string[];
}
