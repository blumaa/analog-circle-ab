/** Visibility tier shared by all user-generated content. */
export type Scope = "analog" | "inner";

export type GroupType = "analog" | "inner";

export interface Member {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  from: string | null;
  bio: string | null;
  interests: string[];
  dietary: string | null;
  whatsappUrl: string | null;
  homeAddress: string | null;
  location: { lat: number; lng: number } | null;
  /** True for the signed-in demo persona (real data); others are fictional. */
  isReal?: boolean;
}

export interface Group {
  id: string;
  type: GroupType;
  name: string;
  /** Inner circles reference their parent Analog group. */
  parentId: string | null;
}

export interface Membership {
  memberId: string;
  groupId: string;
}

export type EventType = "meeting" | "one-on-one" | "event";

export interface EventItem {
  id: string;
  scope: Scope;
  groupId: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  startTime: string;
  endTime: string;
  hostId: string | null;
  creatorId: string;
  address: string | null;
  guideUrl: string | null;
  type: EventType;
}

export type RsvpStatus = "going" | "maybe" | "declined";

export interface Rsvp {
  eventId: string;
  memberId: string;
  status: RsvpStatus;
  note?: string | null;
}

export type LoopKind = "need" | "offer";

export interface LoopPost {
  id: string;
  scope: Scope;
  kind: LoopKind;
  category: string;
  body: string;
  authorId: string;
  archived: boolean;
  createdAt: string;
  notes: { authorId: string; body: string }[];
  helpedBy: string[];
}

export interface WallReply {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  /** Member ids explicitly tagged in the reply body. */
  mentions?: string[];
}

export interface WallPost {
  id: string;
  /** Whose wall this post lives on. */
  ownerId: string;
  authorId: string;
  /** analog = public to the Analog Circle; inner = private to the owner's inner circle. */
  scope: Scope;
  body: string;
  imageUrl: string | null;
  createdAt: string;
  /** Member ids who have liked this post. */
  likedBy: string[];
  /** Threaded replies on this post. */
  replies: WallReply[];
  /** Member ids explicitly tagged in the post body. */
  mentions: string[];
}

export type ActivityType = "wall_post" | "event_created" | "member_joined" | "loop_post" | "mention";

/** A community activity record powering the notifications feed. */
export interface Activity {
  id: string;
  type: ActivityType;
  scope: Scope;
  /** Who performed the action. */
  actorId: string;
  /** The member the activity is about/involves (e.g. wall owner); null if none. */
  subjectId: string | null;
  /** Where clicking the notification navigates. */
  targetRoute: string;
  createdAt: string;
  /** Member ids who have read this activity. */
  readBy: string[];
}
