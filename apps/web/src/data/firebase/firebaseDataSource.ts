import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signOut as fbSignOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../../lib/firebase";
import { addMemberToCircle } from "../../lib/circles";
import { birthdayPostsDue } from "../../lib/birthday";
import { defaultPrefs } from "../../lib/prefs";
import { toggleReaction } from "../../lib/reactions";
import type { DataSource } from "../dataSource";
import { assertPublishable, buildPost, byNewest, feedbackBody, commentActivity, isSelfAddressed, postRoute, replyParentId, type ActivityInput } from "../backendRules";
import { DEV_PASSWORD, devEmail } from "../devAccounts";
import type { Activity, Circle, Comment, Feedback, Member, Post, Prefs, Reactions, Rsvp } from "../types";

/**
 * Firestore layout (one top-level collection per entity):
 *   members/{memberId}          Member without id
 *   accounts/{authUid}          { memberId } — links a Firebase Auth user to a member
 *   circles/{circleId}          Circle without id
 *   posts/{postId}              Post without id
 *   comments/{commentId}        Comment without id
 *   rsvps/{postId}_{memberId}   Rsvp
 *   prefs/{memberId}            Prefs
 *   activity/{activityId}       Activity without id
 *   feedback/{feedbackId}       Feedback without id
 *
 * Members are created by admins before they ever sign in, so a member id is
 * not an Auth uid. The first sign-in claims the member whose email matches the
 * Auth user and records that in accounts/{uid}; security rules resolve the
 * caller's member id through that document.
 */

const EMAIL_LINK_KEY = "analog:emailForSignIn";
/** Firestore caps a batched write at 500 operations. */
const BATCH_LIMIT = 500;

const now = () => new Date().toISOString();

function fromDoc<T extends { id: string }>(snap: QueryDocumentSnapshot): T {
  return { id: snap.id, ...snap.data() } as T;
}

/** Drops the id so it is not stored twice (it is the document id). */
function withoutId<T extends { id: string }>(value: T): Omit<T, "id"> {
  const { id: _id, ...rest } = value;
  return rest;
}

const rsvpId = (postId: string, memberId: string) => `${postId}_${memberId}`;

export function createFirebaseDataSource(): DataSource {
  const a: Auth = auth();
  const d: Firestore = db();

  const list = async <T extends { id: string }>(name: string): Promise<T[]> =>
    (await getDocs(collection(d, name))).docs.map((s) => fromDoc<T>(s));

  const listWhere = async <T extends { id: string }>(name: string, field: string, value: unknown): Promise<T[]> =>
    (await getDocs(query(collection(d, name), where(field, "==", value)))).docs.map((s) => fromDoc<T>(s));

  const getOne = async <T extends { id: string }>(name: string, id: string): Promise<T> => {
    const s = await getDoc(doc(d, name, id));
    if (!s.exists()) throw new Error(`${name}/${id} not found`);
    return { id: s.id, ...s.data() } as T;
  };

  /** Deletes the documents in chunks that fit one batched write each. */
  const deleteAll = async (refs: DocumentReference[]): Promise<void> => {
    for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(d);
      for (const r of refs.slice(i, i + BATCH_LIMIT)) batch.delete(r);
      await batch.commit();
    }
  };

  const refsWhere = async (name: string, field: string, value: unknown) =>
    (await getDocs(query(collection(d, name), where(field, "==", value)))).docs.map((s) => s.ref);

  const log = async (input: ActivityInput): Promise<void> => {
    if (isSelfAddressed(input)) return;
    await setDoc(doc(collection(d, "activity")), { ...input, createdAt: now(), readBy: [] });
  };

  /** Toggles one reaction inside a transaction so concurrent taps do not overwrite each other. */
  const toggleReactionOn = (target: DocumentReference, memberId: string, emoji: string) =>
    runTransaction(d, async (t) => {
      const s = await t.get(target);
      if (!s.exists()) throw new Error(`${target.path} not found`);
      const reactions = (s.data().reactions as Reactions | undefined) ?? {};
      t.update(target, { reactions: toggleReaction(reactions, emoji, memberId) });
    });

  /** Finds the member for an Auth user, claiming it by email on first sign-in. */
  const memberIdFor = async (user: User): Promise<string | null> => {
    const account = await getDoc(doc(d, "accounts", user.uid));
    if (account.exists()) return account.data().memberId as string;
    const email = user.email?.toLowerCase();
    const match = email ? (await listWhere<Member>("members", "email", email))[0] : undefined;
    if (!match) return null;
    await setDoc(doc(d, "accounts", user.uid), { memberId: match.id });
    return match.id;
  };

  const completeEmailLink = async (): Promise<void> => {
    if (!isSignInWithEmailLink(a, window.location.href)) return;
    // The email is saved when the link is requested; a link opened on another
    // device has to ask for it again.
    const email =
      window.localStorage.getItem(EMAIL_LINK_KEY) ||
      window.prompt("Confirm the email you used to request the sign-in link") ||
      "";
    if (!email) return;
    await signInWithEmailLink(a, email, window.location.href);
    window.localStorage.removeItem(EMAIL_LINK_KEY);
    // Strip the one-time link parameters from the URL.
    window.history.replaceState({}, "", window.location.pathname);
  };

  return {
    // Auth
    async getCurrentMemberId() {
      // Firebase restores a persisted session after page load; wait for it so
      // a reload does not bounce to the login page.
      await a.authStateReady();
      await completeEmailLink();
      const user = a.currentUser;
      if (!user) return null;
      const memberId = await memberIdFor(user);
      // A valid email that belongs to no member is not a member session.
      if (!memberId) await fbSignOut(a);
      return memberId;
    },
    async signInWithEmail(email) {
      const normalized = email.trim().toLowerCase();
      window.localStorage.setItem(EMAIL_LINK_KEY, normalized);
      await sendSignInLinkToEmail(a, normalized, { url: window.location.origin, handleCodeInApp: true });
    },
    async devSignInAs(memberId) {
      // Seeded Auth users share one password; see scripts/seed.ts.
      await signInWithEmailAndPassword(a, devEmail(memberId), DEV_PASSWORD);
    },
    async signOut() {
      await fbSignOut(a);
    },

    // Members
    listMembers: () => list<Member>("members"),
    async getMember(id) {
      const s = await getDoc(doc(d, "members", id));
      return s.exists() ? ({ id: s.id, ...s.data() } as Member) : null;
    },
    async createMember(input) {
      const ref = doc(collection(d, "members"));
      const member: Member = {
        ...input,
        email: input.email.trim().toLowerCase(),
        id: ref.id,
        joinedAt: now(),
        birthdayPost: true,
      };
      await setDoc(ref, withoutId(member));
      await log({ type: "member_joined", actorId: member.id, subjectId: null, targetRoute: `/members/${member.id}` });
      return member;
    },
    async updateMember(id, patch) {
      const { id: _id, ...rest } = patch;
      await updateDoc(doc(d, "members", id), rest);
      return getOne<Member>("members", id);
    },
    async deleteMember(id) {
      const circles = await getDocs(query(collection(d, "circles"), where("memberIds", "array-contains", id)));
      const batch = writeBatch(d);
      for (const c of circles.docs) batch.update(c.ref, { memberIds: arrayRemove(id) });
      batch.delete(doc(d, "members", id));
      batch.delete(doc(d, "prefs", id));
      await batch.commit();
      await deleteAll([...(await refsWhere("rsvps", "memberId", id)), ...(await refsWhere("accounts", "memberId", id))]);
    },

    // Circles
    listCircles: () => list<Circle>("circles"),
    async createCircle(input) {
      const ref = doc(collection(d, "circles"));
      const circle: Circle = { ...input, id: ref.id, createdAt: now(), memberIds: [input.createdBy] };
      await setDoc(ref, withoutId(circle));
      return circle;
    },
    async updateCircle(id, patch) {
      await updateDoc(doc(d, "circles", id), patch);
      return getOne<Circle>("circles", id);
    },
    async deleteCircle(id) {
      await deleteDoc(doc(d, "circles", id));
    },
    async addCircleMember(circleId, memberId) {
      const before = await list<Circle>("circles");
      const after = addMemberToCircle(before, circleId, memberId);
      const batch = writeBatch(d);
      after.forEach((c, i) => {
        if (c !== before[i]) batch.update(doc(d, "circles", c.id), { memberIds: c.memberIds });
      });
      await batch.commit();
    },
    async removeCircleMember(circleId, memberId) {
      await updateDoc(doc(d, "circles", circleId), { memberIds: arrayRemove(memberId) });
    },

    // Posts
    async listPosts() {
      const [posts, members] = await Promise.all([list<Post>("posts"), list<Member>("members")]);
      const due = birthdayPostsDue(members, new Set(posts.map((p) => p.id)), new Date());
      // Deterministic ids make this idempotent when several clients race.
      await Promise.all(due.map((p) => setDoc(doc(d, "posts", p.id), withoutId(p))));
      return [...posts, ...due];
    },
    async createPost(input) {
      assertPublishable(await list<Circle>("circles"), input.authorId, input.publishedTo);
      const ref = doc(collection(d, "posts"));
      const post = buildPost(input, ref.id, now());
      await setDoc(ref, withoutId(post));
      await log({ type: "post_created", actorId: post.authorId, subjectId: null, targetRoute: postRoute(post) });
      return post;
    },
    async updatePost(id, patch) {
      if (patch.publishedTo) {
        const [post, circles] = await Promise.all([getOne<Post>("posts", id), list<Circle>("circles")]);
        assertPublishable(circles, post.authorId, patch.publishedTo, post.publishedTo);
      }
      await updateDoc(doc(d, "posts", id), { ...patch, updatedAt: now() });
      return getOne<Post>("posts", id);
    },
    async deletePost(id) {
      await deleteAll([
        ...(await refsWhere("comments", "postId", id)),
        ...(await refsWhere("rsvps", "postId", id)),
        doc(d, "posts", id),
      ]);
    },
    async setPostPinned(id, pinned) {
      await updateDoc(doc(d, "posts", id), { pinned });
      return getOne<Post>("posts", id);
    },
    togglePostReaction: (postId, memberId, emoji) => toggleReactionOn(doc(d, "posts", postId), memberId, emoji),

    // Comments
    listAllComments: () => list<Comment>("comments"),
    async listComments(postId) {
      const comments = await listWhere<Comment>("comments", "postId", postId);
      return comments.toSorted((x, y) => x.createdAt.localeCompare(y.createdAt));
    },
    async addComment(postId, authorId, body, parentId) {
      const post = await getOne<Post>("posts", postId);
      const parent = parentId ? await getOne<Comment>("comments", parentId) : null;
      const ref = doc(collection(d, "comments"));
      const comment: Comment = {
        id: ref.id,
        postId,
        parentId: replyParentId(parent),
        authorId,
        body,
        createdAt: now(),
        updatedAt: null,
        reactions: {},
      };
      const batch = writeBatch(d);
      batch.set(ref, withoutId(comment));
      batch.update(doc(d, "posts", postId), { commentCount: increment(1) });
      await batch.commit();
      await log(commentActivity(post, parent, authorId));
      return comment;
    },
    async updateComment(id, body) {
      await updateDoc(doc(d, "comments", id), { body, updatedAt: now() });
      return getOne<Comment>("comments", id);
    },
    async deleteComment(id) {
      const comment = await getOne<Comment>("comments", id);
      const replies = await refsWhere("comments", "parentId", id);
      const batch = writeBatch(d);
      batch.delete(doc(d, "comments", id));
      for (const r of replies) batch.delete(r);
      batch.update(doc(d, "posts", comment.postId), { commentCount: increment(-(replies.length + 1)) });
      await batch.commit();
    },
    toggleCommentReaction: (commentId, memberId, emoji) =>
      toggleReactionOn(doc(d, "comments", commentId), memberId, emoji),

    // RSVPs
    async listRsvps() {
      return (await getDocs(collection(d, "rsvps"))).docs.map((s) => s.data() as Rsvp);
    },
    async setRsvp(postId, memberId, status) {
      const rsvp: Rsvp = { postId, memberId, status, updatedAt: now() };
      await setDoc(doc(d, "rsvps", rsvpId(postId, memberId)), rsvp);
    },

    // Prefs
    async getPrefs(memberId) {
      const s = await getDoc(doc(d, "prefs", memberId));
      return s.exists() ? ({ ...defaultPrefs(memberId), ...s.data(), memberId } as Prefs) : defaultPrefs(memberId);
    },
    async updatePrefs(memberId, patch) {
      const s = await getDoc(doc(d, "prefs", memberId));
      const current = s.exists() ? ({ ...defaultPrefs(memberId), ...s.data() } as Prefs) : defaultPrefs(memberId);
      const next: Prefs = { ...current, ...patch, memberId };
      await setDoc(doc(d, "prefs", memberId), next);
      return next;
    },

    // Notifications
    async listActivity() {
      return byNewest(await list<Activity>("activity"));
    },
    async markActivityRead(id, memberId) {
      await updateDoc(doc(d, "activity", id), { readBy: arrayUnion(memberId) });
    },
    async markAllActivityRead(memberId) {
      const unread = (await getDocs(collection(d, "activity"))).docs.filter(
        (s) => !((s.data().readBy as string[] | undefined) ?? []).includes(memberId),
      );
      for (let i = 0; i < unread.length; i += BATCH_LIMIT) {
        const batch = writeBatch(d);
        for (const s of unread.slice(i, i + BATCH_LIMIT)) batch.update(s.ref, { readBy: arrayUnion(memberId) });
        await batch.commit();
      }
    },

    // Feedback
    async sendFeedback(authorId, body) {
      const ref = doc(collection(d, "feedback"));
      const feedback: Feedback = { id: ref.id, authorId, body: feedbackBody(body), createdAt: now() };
      await setDoc(ref, withoutId(feedback));
      return feedback;
    },
    async listFeedback() {
      return byNewest(await list<Feedback>("feedback"));
    },
    async deleteFeedback(id) {
      await deleteDoc(doc(d, "feedback", id));
    },

    // Images
    async uploadImage(file) {
      const uid = a.currentUser?.uid;
      if (!uid) throw new Error("Sign in to upload images");
      const target = storageRef(storage(), `images/${uid}/${crypto.randomUUID()}-${file.name}`);
      await uploadBytes(target, file, { contentType: file.type });
      return getDownloadURL(target);
    },
  };
}
