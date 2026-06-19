import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataSource } from "./index";
import type {
  EventItem,
  LoopPost,
  Member,
  RsvpStatus,
  Scope,
  WallPost,
} from "./types";

export const qk = {
  currentMember: ["currentMember"] as const,
  members: (scope?: Scope, groupId?: string) => ["members", scope, groupId] as const,
  member: (id: string) => ["member", id] as const,
  groups: ["groups"] as const,
  innerGroup: (memberId: string) => ["innerGroup", memberId] as const,
  events: (groupId?: string) => ["events", groupId] as const,
  rsvps: (eventId: string) => ["rsvps", eventId] as const,
  loopPosts: ["loopPosts"] as const,
  wallPosts: (ownerId: string) => ["wallPosts", ownerId] as const,
  activity: ["activity"] as const,
};

export function useCurrentMemberId() {
  return useQuery({ queryKey: qk.currentMember, queryFn: () => dataSource.getCurrentMemberId() });
}

export function useMembers(scope?: Scope, groupId?: string) {
  return useQuery({
    queryKey: qk.members(scope, groupId),
    queryFn: () => dataSource.listMembers(scope, groupId),
  });
}

export function useMember(id: string) {
  return useQuery({ queryKey: qk.member(id), queryFn: () => dataSource.getMember(id) });
}

export function useInnerGroup(memberId: string | null | undefined) {
  return useQuery({
    queryKey: qk.innerGroup(memberId ?? ""),
    queryFn: () => dataSource.getInnerGroupForMember(memberId as string),
    enabled: !!memberId,
  });
}

export function useEvents(groupId?: string) {
  return useQuery({ queryKey: qk.events(groupId), queryFn: () => dataSource.listEvents(groupId) });
}

export function useRsvps(eventId: string) {
  return useQuery({ queryKey: qk.rsvps(eventId), queryFn: () => dataSource.listRsvps(eventId) });
}

export function useSetRsvp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: {
      eventId: string;
      memberId: string;
      status: RsvpStatus;
      note?: string | null;
    }) => dataSource.setRsvp(v.eventId, v.memberId, v.status, v.note),
    onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: qk.rsvps(v.eventId) }),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<EventItem, "id">) => dataSource.createEvent(input),
    onSuccess: (ev) => qc.invalidateQueries({ queryKey: qk.events(ev.groupId) }),
  });
}

export function useUpdateEvent(groupId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<EventItem> }) =>
      dataSource.updateEvent(v.id, v.patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events(groupId) }),
  });
}

export function useDeleteEvent(groupId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataSource.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.events(groupId) }),
  });
}

export function useLoopPosts() {
  return useQuery({ queryKey: qk.loopPosts, queryFn: () => dataSource.listLoopPosts() });
}

export function useCreateLoopPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<LoopPost, "id" | "createdAt">) => dataSource.createLoopPost(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.loopPosts }),
  });
}

export function useArchiveLoopPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataSource.archiveLoopPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.loopPosts }),
  });
}

export function useAddLoopNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { postId: string; authorId: string; body: string }) =>
      dataSource.addLoopNote(v.postId, v.authorId, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.loopPosts }),
  });
}

export function useWallPosts(ownerId: string) {
  return useQuery({
    queryKey: qk.wallPosts(ownerId),
    queryFn: () => dataSource.listWallPosts(ownerId),
  });
}

export function useCreateWallPost(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<WallPost, "id" | "createdAt">) => dataSource.createWallPost(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.wallPosts(ownerId) });
      qc.invalidateQueries({ queryKey: qk.activity });
    },
  });
}

export function useDeleteWallPost(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataSource.deleteWallPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wallPosts(ownerId) }),
  });
}

export function useToggleWallPostLike(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { postId: string; memberId: string }) =>
      dataSource.toggleWallPostLike(v.postId, v.memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wallPosts(ownerId) }),
  });
}

export function useAddWallPostReply(ownerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { postId: string; authorId: string; body: string }) =>
      dataSource.addWallPostReply(v.postId, v.authorId, v.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wallPosts(ownerId) }),
  });
}

export function useActivity() {
  return useQuery({ queryKey: qk.activity, queryFn: () => dataSource.listActivity() });
}

export function useMarkActivityRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; memberId: string }) =>
      dataSource.markActivityRead(v.id, v.memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.activity }),
  });
}

export function useMarkAllActivityRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => dataSource.markAllActivityRead(memberId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.activity }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; patch: Partial<Member> }) =>
      dataSource.updateMember(v.id, v.patch),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: qk.member(m.id) });
      qc.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
