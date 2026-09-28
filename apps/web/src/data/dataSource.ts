import type {
  Activity,
  Circle,
  Comment,
  Feedback,
  Member,
  Post,
  PostInput,
  Prefs,
  Rsvp,
  RsvpStatus,
} from "./types";

export type MemberInput = Omit<Member, "id" | "joinedAt" | "birthdayPost">;
export type CircleInput = Omit<Circle, "id" | "createdAt" | "memberIds">;

/**
 * Swappable backend seam. App talks only to this interface.
 * Mock (localStorage) by default; VITE_BACKEND=supabase or firebase picks a cloud backend.
 */
export interface DataSource {
  // Auth
  getCurrentMemberId(): Promise<string | null>;
  signInWithEmail(email: string): Promise<void>;
  devSignInAs(memberId: string): Promise<void>;
  signOut(): Promise<void>;

  // Members
  listMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | null>;
  createMember(input: MemberInput): Promise<Member>;
  updateMember(id: string, patch: Partial<Member>): Promise<Member>;
  deleteMember(id: string): Promise<void>;

  // Circles
  listCircles(): Promise<Circle[]>;
  createCircle(input: CircleInput): Promise<Circle>;
  updateCircle(id: string, patch: Partial<CircleInput>): Promise<Circle>;
  deleteCircle(id: string): Promise<void>;
  /** Adding to an inner circle removes the member from any other inner circle. */
  addCircleMember(circleId: string, memberId: string): Promise<void>;
  removeCircleMember(circleId: string, memberId: string): Promise<void>;

  // Posts. listPosts also creates any due birthday posts.
  listPosts(): Promise<Post[]>;
  createPost(input: PostInput): Promise<Post>;
  updatePost(id: string, patch: Partial<PostInput>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  /** Admins only. Pinning does not mark the post edited. */
  setPostPinned(id: string, pinned: boolean): Promise<Post>;
  togglePostReaction(postId: string, memberId: string, emoji: string): Promise<void>;

  // Comments
  listComments(postId: string): Promise<Comment[]>;
  /** Every comment, for search. */
  listAllComments(): Promise<Comment[]>;
  addComment(postId: string, authorId: string, body: string, parentId: string | null): Promise<Comment>;
  updateComment(id: string, body: string): Promise<Comment>;
  /** Deleting a top-level comment deletes its replies. */
  deleteComment(id: string): Promise<void>;
  toggleCommentReaction(commentId: string, memberId: string, emoji: string): Promise<void>;

  // RSVPs
  listRsvps(): Promise<Rsvp[]>;
  setRsvp(postId: string, memberId: string, status: RsvpStatus): Promise<void>;

  // Prefs (settings, favourites). Only the signed-in member's own.
  getPrefs(memberId: string): Promise<Prefs>;
  updatePrefs(memberId: string, patch: Partial<Omit<Prefs, "memberId">>): Promise<Prefs>;

  // Notifications
  listActivity(): Promise<Activity[]>;
  markActivityRead(id: string, memberId: string): Promise<void>;
  markAllActivityRead(memberId: string): Promise<void>;

  // Feedback. Any member sends; only admins list and delete.
  sendFeedback(authorId: string, body: string): Promise<Feedback>;
  /** Newest first. */
  listFeedback(): Promise<Feedback[]>;
  deleteFeedback(id: string): Promise<void>;

  // Images
  /** Stores an uploaded image and returns a URL to show it. */
  uploadImage(file: File): Promise<string>;
}
