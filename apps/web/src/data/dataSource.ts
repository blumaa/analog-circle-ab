import type {
  Activity,
  EventItem,
  Group,
  LoopPost,
  Member,
  Rsvp,
  RsvpStatus,
  Scope,
  WallPost,
} from "./types";

/**
 * The swappable backend seam. The app talks only to this interface.
 * Slices 0–4 use the localStorage mock; the backend slice swaps in Firebase.
 */
export interface DataSource {
  // Auth / session
  getCurrentMemberId(): Promise<string | null>;
  signInWithEmail(email: string): Promise<void>;
  devSignInAs(memberId: string): Promise<void>;
  signOut(): Promise<void>;

  // Members & groups
  listMembers(scope?: Scope, groupId?: string): Promise<Member[]>;
  getMember(id: string): Promise<Member | null>;
  updateMember(id: string, patch: Partial<Member>): Promise<Member>;
  listGroups(): Promise<Group[]>;
  getInnerGroupForMember(memberId: string): Promise<Group | null>;

  // Events
  listEvents(groupId?: string): Promise<EventItem[]>;
  createEvent(input: Omit<EventItem, "id">): Promise<EventItem>;
  updateEvent(id: string, patch: Partial<EventItem>): Promise<EventItem>;
  deleteEvent(id: string): Promise<void>;

  // RSVPs
  listRsvps(eventId: string): Promise<Rsvp[]>;
  setRsvp(
    eventId: string,
    memberId: string,
    status: RsvpStatus,
    note?: string | null,
  ): Promise<Rsvp>;

  // The Loop
  listLoopPosts(): Promise<LoopPost[]>;
  createLoopPost(input: Omit<LoopPost, "id" | "createdAt">): Promise<LoopPost>;
  archiveLoopPost(id: string): Promise<void>;
  addLoopNote(postId: string, authorId: string, body: string): Promise<LoopPost>;

  // Profile wall
  listWallPosts(ownerId: string): Promise<WallPost[]>;
  createWallPost(input: Omit<WallPost, "id" | "createdAt">): Promise<WallPost>;
  deleteWallPost(id: string): Promise<void>;
  /** Toggle a member's like on a wall post; returns the updated post. */
  toggleWallPostLike(postId: string, memberId: string): Promise<WallPost>;

  /** Append a reply to a wall post; returns the updated post. */
  addWallPostReply(postId: string, authorId: string, body: string, mentions?: string[]): Promise<WallPost>;

  // Activity / notifications
  listActivity(): Promise<Activity[]>;
  markActivityRead(id: string, memberId: string): Promise<void>;
  markAllActivityRead(memberId: string): Promise<void>;
}
