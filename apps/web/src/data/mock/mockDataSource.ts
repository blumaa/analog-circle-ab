import type { DataSource } from "../dataSource";
import type { Comment } from "../types";
import { assertPublishable, buildPost, byNewest, feedbackBody, commentActivity, isSelfAddressed, postRoute, replyParentId, type ActivityInput } from "../backendRules";
import { addMemberToCircle } from "../../lib/circles";
import { birthdayPostsDue } from "../../lib/birthday";
import { defaultPrefs } from "../../lib/prefs";
import { toggleReaction } from "../../lib/reactions";
import { createSeed, type Db } from "./fixtures";

// Bump when the stored shape changes so old demo data is reseeded.
const KEY = "analog-circle:db:v3";

function load(): Db {
  if (typeof localStorage === "undefined") return createSeed();
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw) as Db;
  const db = createSeed();
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

function save(db: Db): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(db));
}

/** Runs fn, turning a throw into a rejected promise like a real backend call. */
function settle<T>(fn: () => T): Promise<T> {
  try {
    return Promise.resolve(fn());
  } catch (err) {
    return Promise.reject(err);
  }
}

/** Load, mutate, save. Returns the mutator's result. */
function tx<T>(fn: (db: Db) => T): Promise<T> {
  return settle(() => {
    const db = load();
    const result = fn(db);
    save(db);
    return result;
  });
}

const read = <T>(fn: (db: Db) => T): Promise<T> => settle(() => fn(load()));

let seq = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const now = () => new Date().toISOString();

function must<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`${what} not found`);
  return value;
}

function log(db: Db, input: ActivityInput): void {
  if (isSelfAddressed(input)) return;
  db.activity.push({ ...input, id: newId("act"), createdAt: now(), readBy: [] });
}

function syncCommentCount(db: Db, postId: string): void {
  const post = db.posts.find((p) => p.id === postId);
  if (post) post.commentCount = db.comments.filter((c) => c.postId === postId).length;
}

/** Mirrors the Firestore rules for admin-only actions. */
function assertAdmin(db: Db, action: string): void {
  if (db.members.find((m) => m.id === db.currentMemberId)?.role !== "admin") throw new Error(`Only admins ${action}`);
}

/** Mirrors the Firestore rule: prefs belong to the signed-in member alone. */
function assertOwnPrefs(db: Db, memberId: string): void {
  if (db.currentMemberId !== memberId) throw new Error(`Prefs of ${memberId} are private`);
}

function addBirthdayPosts(db: Db): boolean {
  const due = birthdayPostsDue(db.members, new Set(db.posts.map((p) => p.id)), new Date());
  db.posts.push(...due);
  return due.length > 0;
}

export function createMockDataSource(): DataSource {
  return {
    // Auth
    getCurrentMemberId: () => read((db) => db.currentMemberId),
    signInWithEmail: (email) =>
      tx((db) => {
        const m = must(
          db.members.find((x) => x.email.toLowerCase() === email.trim().toLowerCase()),
          `Member with email ${email}`,
        );
        db.currentMemberId = m.id;
      }),
    devSignInAs: (memberId) =>
      tx((db) => {
        must(db.members.find((m) => m.id === memberId), `Member ${memberId}`);
        db.currentMemberId = memberId;
      }),
    signOut: () =>
      tx((db) => {
        db.currentMemberId = null;
      }),

    // Members
    listMembers: () => read((db) => db.members),
    getMember: (id) => read((db) => db.members.find((m) => m.id === id) ?? null),
    createMember: (input) =>
      tx((db) => {
        const member = { ...input, id: newId("m"), joinedAt: now(), birthdayPost: true };
        db.members.push(member);
        log(db, { type: "member_joined", actorId: member.id, subjectId: null, targetRoute: `/members/${member.id}` });
        return member;
      }),
    updateMember: (id, patch) =>
      tx((db) => {
        const m = must(db.members.find((x) => x.id === id), `Member ${id}`);
        Object.assign(m, patch, { id });
        return m;
      }),
    deleteMember: (id) =>
      tx((db) => {
        db.members = db.members.filter((m) => m.id !== id);
        db.circles = db.circles.map((c) => ({ ...c, memberIds: c.memberIds.filter((x) => x !== id) }));
        db.rsvps = db.rsvps.filter((r) => r.memberId !== id);
        db.prefs = db.prefs.filter((p) => p.memberId !== id);
      }),

    // Circles
    listCircles: () => read((db) => db.circles),
    createCircle: (input) =>
      tx((db) => {
        const circle = { ...input, id: newId("circle"), createdAt: now(), memberIds: [input.createdBy] };
        db.circles.push(circle);
        return circle;
      }),
    updateCircle: (id, patch) =>
      tx((db) => {
        const c = must(db.circles.find((x) => x.id === id), `Circle ${id}`);
        Object.assign(c, patch);
        return c;
      }),
    deleteCircle: (id) =>
      tx((db) => {
        db.circles = db.circles.filter((c) => c.id !== id);
      }),
    addCircleMember: (circleId, memberId) =>
      tx((db) => {
        db.circles = addMemberToCircle(db.circles, circleId, memberId);
      }),
    removeCircleMember: (circleId, memberId) =>
      tx((db) => {
        const c = must(db.circles.find((x) => x.id === circleId), `Circle ${circleId}`);
        c.memberIds = c.memberIds.filter((x) => x !== memberId);
      }),

    // Posts
    listPosts: () => {
      const db = load();
      if (addBirthdayPosts(db)) save(db);
      return Promise.resolve(db.posts);
    },
    createPost: (input) =>
      tx((db) => {
        assertPublishable(db.circles, input.authorId, input.publishedTo);
        const post = buildPost(input, newId("post"), now());
        db.posts.push(post);
        log(db, { type: "post_created", actorId: post.authorId, subjectId: null, targetRoute: postRoute(post) });
        return post;
      }),
    updatePost: (id, patch) =>
      tx((db) => {
        const p = must(db.posts.find((x) => x.id === id), `Post ${id}`);
        if (patch.publishedTo) assertPublishable(db.circles, p.authorId, patch.publishedTo, p.publishedTo);
        Object.assign(p, patch, { updatedAt: now() });
        return p;
      }),
    deletePost: (id) =>
      tx((db) => {
        db.posts = db.posts.filter((p) => p.id !== id);
        db.comments = db.comments.filter((c) => c.postId !== id);
        db.rsvps = db.rsvps.filter((r) => r.postId !== id);
      }),
    setPostPinned: (id, pinned) =>
      tx((db) => {
        assertAdmin(db, "pin posts");
        const p = must(db.posts.find((x) => x.id === id), `Post ${id}`);
        p.pinned = pinned;
        return p;
      }),
    togglePostReaction: (postId, memberId, emoji) =>
      tx((db) => {
        const p = must(db.posts.find((x) => x.id === postId), `Post ${postId}`);
        p.reactions = toggleReaction(p.reactions, emoji, memberId);
      }),

    // Comments
    listComments: (postId) =>
      read((db) =>
        db.comments
          .filter((c) => c.postId === postId)
          .toSorted((a, b) => a.createdAt.localeCompare(b.createdAt)),
      ),
    listAllComments: () => read((db) => db.comments),
    addComment: (postId, authorId, body, parentId) =>
      tx((db) => {
        const post = must(db.posts.find((p) => p.id === postId), `Post ${postId}`);
        const parent = parentId ? must(db.comments.find((c) => c.id === parentId), `Comment ${parentId}`) : null;
        const comment: Comment = {
          id: newId("c"),
          postId,
          parentId: replyParentId(parent),
          authorId,
          body,
          createdAt: now(),
          updatedAt: null,
          reactions: {},
        };
        db.comments.push(comment);
        syncCommentCount(db, postId);
        log(db, commentActivity(post, parent, authorId));
        return comment;
      }),
    updateComment: (id, body) =>
      tx((db) => {
        const c = must(db.comments.find((x) => x.id === id), `Comment ${id}`);
        c.body = body;
        c.updatedAt = now();
        return c;
      }),
    deleteComment: (id) =>
      tx((db) => {
        const c = must(db.comments.find((x) => x.id === id), `Comment ${id}`);
        db.comments = db.comments.filter((x) => x.id !== id && x.parentId !== id);
        syncCommentCount(db, c.postId);
      }),
    toggleCommentReaction: (commentId, memberId, emoji) =>
      tx((db) => {
        const c = must(db.comments.find((x) => x.id === commentId), `Comment ${commentId}`);
        c.reactions = toggleReaction(c.reactions, emoji, memberId);
      }),

    // RSVPs
    listRsvps: () => read((db) => db.rsvps),
    setRsvp: (postId, memberId, status) =>
      tx((db) => {
        db.rsvps = db.rsvps.filter((r) => !(r.postId === postId && r.memberId === memberId));
        db.rsvps.push({ postId, memberId, status, updatedAt: now() });
      }),

    // Prefs
    getPrefs: (memberId) =>
      read((db) => {
        assertOwnPrefs(db, memberId);
        return db.prefs.find((p) => p.memberId === memberId) ?? defaultPrefs(memberId);
      }),
    updatePrefs: (memberId, patch) =>
      tx((db) => {
        assertOwnPrefs(db, memberId);
        const current = db.prefs.find((p) => p.memberId === memberId) ?? defaultPrefs(memberId);
        const next = { ...current, ...patch, memberId };
        db.prefs = [...db.prefs.filter((p) => p.memberId !== memberId), next];
        return next;
      }),

    // Notifications
    listActivity: () => read((db) => byNewest(db.activity)),
    markActivityRead: (id, memberId) =>
      tx((db) => {
        const a = must(db.activity.find((x) => x.id === id), `Activity ${id}`);
        if (!a.readBy.includes(memberId)) a.readBy.push(memberId);
      }),
    markAllActivityRead: (memberId) =>
      tx((db) => {
        for (const a of db.activity) if (!a.readBy.includes(memberId)) a.readBy.push(memberId);
      }),

    // Feedback
    sendFeedback: (authorId, body) =>
      tx((db) => {
        const feedback = { id: newId("fb"), authorId, body: feedbackBody(body), createdAt: now() };
        db.feedback.push(feedback);
        return feedback;
      }),
    listFeedback: () =>
      read((db) => {
        assertAdmin(db, "read feedback");
        return byNewest(db.feedback);
      }),
    deleteFeedback: (id) =>
      tx((db) => {
        assertAdmin(db, "delete feedback");
        db.feedback = db.feedback.filter((f) => f.id !== id);
      }),

    // Images: inlined as data URLs, since the mock has no file storage.
    uploadImage: (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }),
  };
}
