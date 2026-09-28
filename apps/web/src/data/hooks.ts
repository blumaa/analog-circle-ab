import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { dataSource } from "./index";
import type { CircleInput, MemberInput } from "./dataSource";
import type { Member, PostInput, Prefs, RsvpStatus } from "./types";
import { toggleId } from "../lib/prefs";

export const qk = {
  currentMemberId: ["currentMemberId"] as const,
  members: ["members"] as const,
  circles: ["circles"] as const,
  posts: ["posts"] as const,
  comments: (postId: string) => ["comments", postId] as const,
  /** Prefix of every per-post comments key, so invalidating it refreshes them all. */
  allComments: ["comments"] as const,
  rsvps: ["rsvps"] as const,
  prefs: (memberId: string) => ["prefs", memberId] as const,
  activity: ["activity"] as const,
  feedback: ["feedback"] as const,
};

/** Mutation that invalidates the given query keys on success. */
function useDataMutation<V, R>(fn: (v: V) => Promise<R>, keys: (v: V) => QueryKey[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_r, v) => Promise.all(keys(v).map((queryKey) => qc.invalidateQueries({ queryKey }))),
  });
}

// Auth

export function useCurrentMemberId() {
  return useQuery({ queryKey: qk.currentMemberId, queryFn: () => dataSource.getCurrentMemberId() });
}

/** Signed-in member, or null. */
export function useMe(): { me: Member | null; isLoading: boolean } {
  const id = useCurrentMemberId();
  const members = useMembers();
  const me = members.data?.find((m) => m.id === id.data) ?? null;
  return { me, isLoading: id.isLoading || members.isLoading };
}

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => dataSource.signOut(),
    onSuccess: () => qc.clear(),
  });
}

// Members

export function useMembers() {
  return useQuery({ queryKey: qk.members, queryFn: () => dataSource.listMembers() });
}

export function useCreateMember() {
  return useDataMutation((input: MemberInput) => dataSource.createMember(input), () => [qk.members, qk.activity]);
}

export function useUpdateMember() {
  return useDataMutation(
    (v: { id: string; patch: Partial<Member> }) => dataSource.updateMember(v.id, v.patch),
    () => [qk.members],
  );
}

export function useDeleteMember() {
  return useDataMutation((id: string) => dataSource.deleteMember(id), () => [qk.members, qk.circles, qk.rsvps]);
}

// Circles

export function useCircles() {
  return useQuery({ queryKey: qk.circles, queryFn: () => dataSource.listCircles() });
}

export function useCreateCircle() {
  return useDataMutation((input: CircleInput) => dataSource.createCircle(input), () => [qk.circles]);
}

export function useUpdateCircle() {
  return useDataMutation(
    (v: { id: string; patch: Partial<CircleInput> }) => dataSource.updateCircle(v.id, v.patch),
    () => [qk.circles],
  );
}

export function useDeleteCircle() {
  return useDataMutation((id: string) => dataSource.deleteCircle(id), () => [qk.circles]);
}

export function useSetCircleMembership() {
  return useDataMutation(
    (v: { circleId: string; memberId: string; member: boolean }) =>
      v.member
        ? dataSource.addCircleMember(v.circleId, v.memberId)
        : dataSource.removeCircleMember(v.circleId, v.memberId),
    () => [qk.circles],
  );
}

// Posts

export function usePosts() {
  return useQuery({ queryKey: qk.posts, queryFn: () => dataSource.listPosts() });
}

export function useCreatePost() {
  return useDataMutation((input: PostInput) => dataSource.createPost(input), () => [qk.posts, qk.activity]);
}

export function useUpdatePost() {
  return useDataMutation(
    (v: { id: string; patch: Partial<PostInput> }) => dataSource.updatePost(v.id, v.patch),
    () => [qk.posts],
  );
}

export function useSetPostPinned() {
  return useDataMutation((v: { id: string; pinned: boolean }) => dataSource.setPostPinned(v.id, v.pinned), () => [qk.posts]);
}

export function useDeletePost() {
  return useDataMutation((id: string) => dataSource.deletePost(id), (id) => [qk.posts, qk.comments(id), qk.rsvps]);
}

export function useTogglePostReaction() {
  return useDataMutation(
    (v: { postId: string; memberId: string; emoji: string }) =>
      dataSource.togglePostReaction(v.postId, v.memberId, v.emoji),
    () => [qk.posts],
  );
}

// Comments

export function useComments(postId: string, enabled = true) {
  return useQuery({
    queryKey: qk.comments(postId),
    queryFn: () => dataSource.listComments(postId),
    enabled,
  });
}

/** Every comment, for search. Loads only while enabled. */
export function useAllComments(enabled: boolean) {
  return useQuery({ queryKey: qk.allComments, queryFn: () => dataSource.listAllComments(), enabled });
}

export function useAddComment() {
  return useDataMutation(
    (v: { postId: string; authorId: string; body: string; parentId: string | null }) =>
      dataSource.addComment(v.postId, v.authorId, v.body, v.parentId),
    () => [qk.allComments, qk.posts, qk.activity],
  );
}

export function useUpdateComment() {
  return useDataMutation(
    (v: { id: string; postId: string; body: string }) => dataSource.updateComment(v.id, v.body),
    () => [qk.allComments],
  );
}

export function useDeleteComment() {
  return useDataMutation(
    (v: { id: string; postId: string }) => dataSource.deleteComment(v.id),
    () => [qk.allComments, qk.posts],
  );
}

export function useToggleCommentReaction() {
  return useDataMutation(
    (v: { commentId: string; postId: string; memberId: string; emoji: string }) =>
      dataSource.toggleCommentReaction(v.commentId, v.memberId, v.emoji),
    (v) => [qk.comments(v.postId)],
  );
}

// RSVPs

export function useRsvps() {
  return useQuery({ queryKey: qk.rsvps, queryFn: () => dataSource.listRsvps() });
}

export function useSetRsvp() {
  return useDataMutation(
    (v: { postId: string; memberId: string; status: RsvpStatus }) =>
      dataSource.setRsvp(v.postId, v.memberId, v.status),
    () => [qk.rsvps],
  );
}

// Prefs

export function usePrefs(memberId: string | null | undefined) {
  return useQuery({
    queryKey: qk.prefs(memberId ?? ""),
    queryFn: () => dataSource.getPrefs(memberId as string),
    enabled: !!memberId,
  });
}

export function useUpdatePrefs() {
  return useDataMutation(
    (v: { memberId: string; patch: Partial<Omit<Prefs, "memberId">> }) =>
      dataSource.updatePrefs(v.memberId, v.patch),
    (v) => [qk.prefs(v.memberId), qk.posts],
  );
}

// Notifications

export function useActivity() {
  return useQuery({ queryKey: qk.activity, queryFn: () => dataSource.listActivity() });
}

export function useMarkActivityRead() {
  return useDataMutation(
    (v: { id: string; memberId: string }) => dataSource.markActivityRead(v.id, v.memberId),
    () => [qk.activity],
  );
}

export function useMarkAllActivityRead() {
  return useDataMutation((memberId: string) => dataSource.markAllActivityRead(memberId), () => [qk.activity]);
}

type PrefList = "favouritePostIds";

/** One of the viewer's id lists in prefs (favourites) with a toggle. */
export function usePrefList(memberId: string | null | undefined, key: PrefList) {
  const { data: prefs } = usePrefs(memberId);
  const update = useUpdatePrefs();
  const ids = prefs?.[key] ?? [];
  const toggle = (id: string) => {
    if (!memberId || !prefs) return;
    update.mutate({ memberId, patch: { [key]: toggleId(prefs[key], id) } });
  };
  return { ids, has: (id: string) => ids.includes(id), toggle };
}

// Feedback

export function useSendFeedback() {
  return useDataMutation(
    (v: { authorId: string; body: string }) => dataSource.sendFeedback(v.authorId, v.body),
    () => [qk.feedback],
  );
}

export function useFeedback() {
  return useQuery({ queryKey: qk.feedback, queryFn: () => dataSource.listFeedback() });
}

export function useDeleteFeedback() {
  return useDataMutation((id: string) => dataSource.deleteFeedback(id), () => [qk.feedback]);
}

// Images

export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => dataSource.uploadImage(file) });
}
