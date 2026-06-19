import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut as fbSignOut,
  type Auth,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import type { DataSource } from "../dataSource";
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
  WallReply,
} from "../types";

/** Deterministic credentials for the seeded demo persona (dev-bypass sign-in only). */
const DEV_PASSWORD = "analog-demo-pw";
const DEMO_EMAIL = "blumaa@gmail.com"; // Aaron — seeded with uid "aaron"
const EMAIL_LINK_KEY = "analog:emailForSignIn";

const all = async <T>(d: Firestore, name: string): Promise<T[]> => {
  const snap = await getDocs(collection(d, name));
  return snap.docs.map((s) => ({ id: s.id, ...s.data() }) as T);
};

/** Append a fresh, unread activity record. */
const addActivity = (
  d: Firestore,
  input: Omit<Activity, "id" | "createdAt" | "readBy">,
): Promise<void> => {
  const ref = doc(collection(d, "activity"));
  return setDoc(ref, { ...input, createdAt: new Date().toISOString(), readBy: [] });
};

export function createFirebaseDataSource(): DataSource {
  const a: Auth = auth();
  const d: Firestore = db();

  const currentUid = () => a.currentUser?.uid ?? null;

  return {
    async getCurrentMemberId() {
      // Firebase restores a persisted session asynchronously after page load —
      // wait for that before reading currentUser, or a reload bounces to login.
      await a.authStateReady();
      // Complete a magic-link sign-in if we landed on the callback URL.
      if (isSignInWithEmailLink(a, window.location.href)) {
        // Prefer the email saved when the link was requested; fall back to a
        // prompt when the link is opened on a different device/browser.
        const email =
          window.localStorage.getItem(EMAIL_LINK_KEY) ||
          window.prompt("Confirm the email you used to request the sign-in link") ||
          "";
        if (email) {
          await signInWithEmailLink(a, email, window.location.href);
          window.localStorage.removeItem(EMAIL_LINK_KEY);
          // Strip the one-time link params from the URL.
          window.history.replaceState({}, "", window.location.pathname);
        }
      }
      return currentUid();
    },
    async signInWithEmail(email) {
      window.localStorage.setItem(EMAIL_LINK_KEY, email);
      await sendSignInLinkToEmail(a, email, {
        url: `${window.location.origin}/innercircle/dashboard`,
        handleCodeInApp: true,
      });
    },
    async devSignInAs(_memberId) {
      // Dev bypass: sign in as the seeded demo persona (rules block reading
      // member docs pre-auth, so we use a fixed demo credential).
      await signInWithEmailAndPassword(a, DEMO_EMAIL, DEV_PASSWORD);
    },
    async signOut() {
      await fbSignOut(a);
    },

    async listMembers(scope?: Scope, groupId?: string) {
      if (scope === "inner" && groupId) {
        const ms = await getDocs(
          query(collection(d, "memberships"), where("groupId", "==", groupId)),
        );
        const ids = new Set(ms.docs.map((s) => s.data().memberId as string));
        const members = await all<Member>(d, "members");
        return members.filter((m) => ids.has(m.id));
      }
      return all<Member>(d, "members");
    },
    async getMember(id) {
      const s = await getDoc(doc(d, "members", id));
      return s.exists() ? ({ id: s.id, ...s.data() } as Member) : null;
    },
    async updateMember(id, patch) {
      await updateDoc(doc(d, "members", id), patch);
      const s = await getDoc(doc(d, "members", id));
      return { id: s.id, ...s.data() } as Member;
    },
    listGroups: () => all<Group>(d, "groups"),
    async getInnerGroupForMember(memberId) {
      const ms = await getDocs(
        query(collection(d, "memberships"), where("memberId", "==", memberId)),
      );
      const first = ms.docs[0];
      if (!first) return null;
      const g = await getDoc(doc(d, "groups", first.data().groupId as string));
      return g.exists() ? ({ id: g.id, ...g.data() } as Group) : null;
    },

    async listEvents(groupId?: string) {
      const events = await all<EventItem>(d, "events");
      const list = groupId ? events.filter((e) => e.groupId === groupId) : events;
      return list.sort((x, y) => x.date.localeCompare(y.date));
    },
    async createEvent(input) {
      const ref = doc(collection(d, "events"));
      const ev = { ...input, id: ref.id };
      await setDoc(ref, input);
      await addActivity(d, {
        type: "event_created",
        scope: input.scope,
        actorId: input.creatorId,
        subjectId: null,
        targetRoute: `/innercircle/event/${ev.id}`,
      });
      return ev;
    },
    async updateEvent(id, patch) {
      await updateDoc(doc(d, "events", id), patch);
      const s = await getDoc(doc(d, "events", id));
      return { id: s.id, ...s.data() } as EventItem;
    },
    async deleteEvent(id) {
      await deleteDoc(doc(d, "events", id));
    },

    async listRsvps(eventId) {
      const snap = await getDocs(
        query(collection(d, "rsvps"), where("eventId", "==", eventId)),
      );
      return snap.docs.map((s) => s.data() as Rsvp);
    },
    async setRsvp(eventId, memberId, status: RsvpStatus, note?: string | null) {
      // Going back to "going" clears any stale decline/maybe reason.
      const rsvp: Rsvp = {
        eventId,
        memberId,
        status,
        note: status === "going" ? null : (note ?? null),
      };
      await setDoc(doc(d, "rsvps", `${eventId}_${memberId}`), rsvp);
      return rsvp;
    },

    async listLoopPosts() {
      const posts = await all<LoopPost>(d, "loopPosts");
      return posts.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
    },
    async createLoopPost(input) {
      const ref = doc(collection(d, "loopPosts"));
      const stored = { ...input, createdAt: new Date().toISOString(), notes: input.notes ?? [], helpedBy: input.helpedBy ?? [] };
      await setDoc(ref, stored);
      await addActivity(d, {
        type: "loop_post",
        scope: input.scope,
        actorId: input.authorId,
        subjectId: null,
        targetRoute: `/innercircle/the-loop`,
      });
      return { ...stored, id: ref.id };
    },
    async archiveLoopPost(id) {
      await updateDoc(doc(d, "loopPosts", id), { archived: true });
    },
    async addLoopNote(postId, authorId, body) {
      const ref = doc(d, "loopPosts", postId);
      await updateDoc(ref, {
        notes: arrayUnion({ authorId, body }),
        helpedBy: arrayUnion(authorId),
      });
      const s = await getDoc(ref);
      return { id: s.id, ...s.data() } as LoopPost;
    },

    async listWallPosts(ownerId) {
      const snap = await getDocs(
        query(collection(d, "wallPosts"), where("ownerId", "==", ownerId)),
      );
      return snap.docs
        .map((s) => {
          const data = s.data();
          // Back-compat: documents written before replies/mentions existed won't have these fields.
          return {
            id: s.id,
            ...data,
            replies: data["replies"] ?? [],
            mentions: data["mentions"] ?? [],
          } as WallPost;
        })
        .sort((x, y) => y.createdAt.localeCompare(x.createdAt));
    },
    async createWallPost(input) {
      const ref = doc(collection(d, "wallPosts"));
      const now = new Date().toISOString();
      const post: WallPost = {
        ...input,
        id: ref.id,
        createdAt: now,
        likedBy: input.likedBy ?? [],
        replies: input.replies ?? [],
        mentions: input.mentions ?? [],
      };
      await setDoc(ref, { ...input, createdAt: now, likedBy: post.likedBy, mentions: post.mentions });
      await addActivity(d, {
        type: "wall_post",
        scope: input.scope,
        actorId: input.authorId,
        subjectId: input.ownerId,
        targetRoute: `/innercircle/members/${input.ownerId}`,
      });
      // One "mention" activity per tagged member, skipping self-tags.
      for (const mentionedId of post.mentions) {
        if (mentionedId === input.authorId) continue;
        await addActivity(d, {
          type: "mention",
          scope: input.scope,
          actorId: input.authorId,
          subjectId: mentionedId,
          targetRoute: `/innercircle/members/${input.ownerId}`,
        });
      }
      return post;
    },
    async deleteWallPost(id) {
      await deleteDoc(doc(d, "wallPosts", id));
    },
    async toggleWallPostLike(postId, memberId) {
      const ref = doc(d, "wallPosts", postId);
      const current = await getDoc(ref);
      const likedBy = (current.data()?.likedBy as string[] | undefined) ?? [];
      await updateDoc(ref, {
        likedBy: likedBy.includes(memberId) ? arrayRemove(memberId) : arrayUnion(memberId),
      });
      const s = await getDoc(ref);
      const data = s.data();
      return { id: s.id, ...data, replies: data?.["replies"] ?? [], mentions: data?.["mentions"] ?? [] } as WallPost;
    },
    async addWallPostReply(postId, authorId, body, mentions = []) {
      const ref = doc(d, "wallPosts", postId);
      // arrayUnion appends an object element; Firestore preserves insertion order.
      const reply: WallReply = {
        id: `reply-${Date.now().toString(36)}`,
        authorId,
        body,
        createdAt: new Date().toISOString(),
        mentions,
      };
      await updateDoc(ref, { replies: arrayUnion(reply) });
      // Fetch the post's scope to construct the correct targetRoute for mention activities.
      const s = await getDoc(ref);
      const data = s.data();
      const postScope = (data?.["scope"] as WallPost["scope"] | undefined) ?? "analog";
      const postOwnerId = (data?.["ownerId"] as string | undefined) ?? "";
      // One "mention" activity per tagged member, skipping self-tags.
      for (const mentionedId of mentions) {
        if (mentionedId === authorId) continue;
        await addActivity(d, {
          type: "mention",
          scope: postScope,
          actorId: authorId,
          subjectId: mentionedId,
          targetRoute: `/innercircle/members/${postOwnerId}`,
        });
      }
      return { id: s.id, ...data, replies: data?.["replies"] ?? [], mentions: data?.["mentions"] ?? [] } as WallPost;
    },

    async listActivity() {
      const items = await all<Activity>(d, "activity");
      return items.sort((x, y) => y.createdAt.localeCompare(x.createdAt));
    },
    async markActivityRead(id, memberId) {
      await updateDoc(doc(d, "activity", id), { readBy: arrayUnion(memberId) });
    },
    async markAllActivityRead(memberId) {
      const snap = await getDocs(collection(d, "activity"));
      const batch = writeBatch(d);
      for (const s of snap.docs) {
        batch.update(s.ref, { readBy: arrayUnion(memberId) });
      }
      await batch.commit();
    },
  };
}
