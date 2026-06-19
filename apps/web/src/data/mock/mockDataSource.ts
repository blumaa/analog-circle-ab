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
import * as seed from "./fixtures";

interface Db {
  members: Member[];
  groups: Group[];
  memberships: { memberId: string; groupId: string }[];
  events: EventItem[];
  rsvps: Rsvp[];
  loopPosts: LoopPost[];
  wallPosts: WallPost[];
  activity: Activity[];
  currentMemberId: string | null;
}

const KEY = "analog-circle:db:v1";

function freshDb(): Db {
  return {
    members: structuredClone(seed.members),
    groups: structuredClone(seed.groups),
    memberships: structuredClone(seed.memberships),
    events: structuredClone(seed.events),
    rsvps: structuredClone(seed.rsvps),
    loopPosts: structuredClone(seed.loopPosts),
    wallPosts: structuredClone(seed.wallPosts),
    activity: structuredClone(seed.activity),
    currentMemberId: seed.CURRENT_MEMBER_ID,
  };
}

/** Append a fresh, unread activity record to the db (mutates db.activity). */
function pushActivity(db: Db, input: Omit<Activity, "id" | "createdAt" | "readBy">): void {
  db.activity.push({
    ...input,
    id: id("act"),
    createdAt: new Date().toISOString(),
    readBy: [],
  });
}

function load(): Db {
  if (typeof localStorage === "undefined") return freshDb();
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const db = freshDb();
    localStorage.setItem(KEY, JSON.stringify(db));
    return db;
  }
  return JSON.parse(raw) as Db;
}

function save(db: Db): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(db));
  }
}

const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(performance.now() * 1000).toString(36)}`;

/** Async wrapper to mimic network latency-free promises and match the Firebase shape. */
const ok = <T>(value: T): Promise<T> => Promise.resolve(value);

export function createMockDataSource(): DataSource {
  return {
    getCurrentMemberId: () => ok(load().currentMemberId),
    signInWithEmail: (email) => {
      const db = load();
      const m = db.members.find((x) => x.email.toLowerCase() === email.toLowerCase());
      db.currentMemberId = m?.id ?? seed.CURRENT_MEMBER_ID;
      save(db);
      return ok(undefined);
    },
    devSignInAs: (memberId) => {
      const db = load();
      db.currentMemberId = memberId;
      save(db);
      return ok(undefined);
    },
    signOut: () => {
      const db = load();
      db.currentMemberId = null;
      save(db);
      return ok(undefined);
    },

    listMembers: (scope?: Scope, groupId?: string) => {
      const db = load();
      if (scope === "inner" && groupId) {
        const ids = new Set(
          db.memberships.filter((x) => x.groupId === groupId).map((x) => x.memberId),
        );
        return ok(db.members.filter((m) => ids.has(m.id)));
      }
      return ok(db.members);
    },
    getMember: (mid) => ok(load().members.find((m) => m.id === mid) ?? null),
    updateMember: (mid, patch) => {
      const db = load();
      const m = db.members.find((x) => x.id === mid);
      if (!m) throw new Error(`Member ${mid} not found`);
      Object.assign(m, patch);
      save(db);
      return ok(m);
    },
    listGroups: () => ok(load().groups),
    getInnerGroupForMember: (mid) => {
      const db = load();
      const ms = db.memberships.find((x) => x.memberId === mid);
      const g = ms ? db.groups.find((x) => x.id === ms.groupId) : null;
      return ok(g ?? null);
    },

    listEvents: (groupId?: string) => {
      const db = load();
      const list = groupId ? db.events.filter((e) => e.groupId === groupId) : db.events;
      return ok([...list].sort((a, b) => a.date.localeCompare(b.date)));
    },
    createEvent: (input) => {
      const db = load();
      const ev: EventItem = { ...input, id: id("event") };
      db.events.push(ev);
      pushActivity(db, {
        type: "event_created",
        scope: input.scope,
        actorId: input.creatorId,
        subjectId: null,
        targetRoute: `/innercircle/event/${ev.id}`,
      });
      save(db);
      return ok(ev);
    },
    updateEvent: (eid, patch) => {
      const db = load();
      const ev = db.events.find((x) => x.id === eid);
      if (!ev) throw new Error(`Event ${eid} not found`);
      Object.assign(ev, patch);
      save(db);
      return ok(ev);
    },
    deleteEvent: (eid) => {
      const db = load();
      db.events = db.events.filter((x) => x.id !== eid);
      db.rsvps = db.rsvps.filter((x) => x.eventId !== eid);
      save(db);
      return ok(undefined);
    },

    listRsvps: (eventId) => ok(load().rsvps.filter((r) => r.eventId === eventId)),
    setRsvp: (eventId, memberId, status: RsvpStatus, note?: string | null) => {
      const db = load();
      // Going back to "going" clears any stale decline/maybe reason.
      const nextNote = status === "going" ? null : (note ?? null);
      let r = db.rsvps.find((x) => x.eventId === eventId && x.memberId === memberId);
      if (r) {
        r.status = status;
        r.note = nextNote;
      } else {
        r = { eventId, memberId, status, note: nextNote };
        db.rsvps.push(r);
      }
      save(db);
      return ok(r);
    },

    listLoopPosts: () =>
      ok(
        [...load().loopPosts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    createLoopPost: (input) => {
      const db = load();
      const post: LoopPost = {
        ...input,
        id: id("loop"),
        createdAt: new Date().toISOString(),
        notes: input.notes ?? [],
        helpedBy: input.helpedBy ?? [],
      };
      db.loopPosts.push(post);
      pushActivity(db, {
        type: "loop_post",
        scope: input.scope,
        actorId: input.authorId,
        subjectId: null,
        targetRoute: `/innercircle/the-loop`,
      });
      save(db);
      return ok(post);
    },
    archiveLoopPost: (pid) => {
      const db = load();
      const p = db.loopPosts.find((x) => x.id === pid);
      if (p) p.archived = true;
      save(db);
      return ok(undefined);
    },
    addLoopNote: (postId, authorId, body) => {
      const db = load();
      const p = db.loopPosts.find((x) => x.id === postId);
      if (!p) throw new Error(`LoopPost ${postId} not found`);
      p.notes = [...(p.notes ?? []), { authorId, body }];
      if (!p.helpedBy.includes(authorId)) p.helpedBy = [...p.helpedBy, authorId];
      save(db);
      return ok(p);
    },

    listWallPosts: (ownerId) =>
      ok(
        load()
          .wallPosts.filter((p) => p.ownerId === ownerId)
          // Back-compat: seed data written before replies/mentions existed won't have these fields.
          .map((p) => ({ ...p, replies: p.replies ?? [], mentions: p.mentions ?? [] }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    createWallPost: (input) => {
      const db = load();
      const now = new Date().toISOString();
      const post: WallPost = {
        ...input,
        id: id("wall"),
        createdAt: now,
        likedBy: input.likedBy ?? [],
        replies: input.replies ?? [],
        mentions: input.mentions ?? [],
      };
      db.wallPosts.push(post);
      pushActivity(db, {
        type: "wall_post",
        scope: input.scope,
        actorId: input.authorId,
        subjectId: input.ownerId,
        targetRoute: `/innercircle/members/${input.ownerId}`,
      });
      // One "mention" activity per tagged member, skipping self-tags.
      for (const mentionedId of post.mentions) {
        if (mentionedId === input.authorId) continue;
        pushActivity(db, {
          type: "mention",
          scope: input.scope,
          actorId: input.authorId,
          subjectId: mentionedId,
          targetRoute: `/innercircle/members/${input.ownerId}`,
        });
      }
      save(db);
      return ok(post);
    },
    deleteWallPost: (pid) => {
      const db = load();
      db.wallPosts = db.wallPosts.filter((x) => x.id !== pid);
      save(db);
      return ok(undefined);
    },
    toggleWallPostLike: (postId, memberId) => {
      const db = load();
      const p = db.wallPosts.find((x) => x.id === postId);
      if (!p) throw new Error(`WallPost ${postId} not found`);
      p.likedBy = p.likedBy.includes(memberId)
        ? p.likedBy.filter((mid) => mid !== memberId)
        : [...p.likedBy, memberId];
      save(db);
      return ok(p);
    },
    addWallPostReply: (postId, authorId, body, mentions = []) => {
      const db = load();
      const p = db.wallPosts.find((x) => x.id === postId);
      if (!p) throw new Error(`WallPost ${postId} not found`);
      const reply: WallReply = {
        id: id("reply"),
        authorId,
        body,
        createdAt: new Date().toISOString(),
        mentions,
      };
      p.replies = [...(p.replies ?? []), reply];
      // One "mention" activity per tagged member, skipping self-tags.
      for (const mentionedId of mentions) {
        if (mentionedId === authorId) continue;
        pushActivity(db, {
          type: "mention",
          scope: p.scope,
          actorId: authorId,
          subjectId: mentionedId,
          targetRoute: `/innercircle/members/${p.ownerId}`,
        });
      }
      save(db);
      return ok(p);
    },

    listActivity: () =>
      ok([...load().activity].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    markActivityRead: (aid, memberId) => {
      const db = load();
      const a = db.activity.find((x) => x.id === aid);
      if (a && !a.readBy.includes(memberId)) a.readBy = [...a.readBy, memberId];
      save(db);
      return ok(undefined);
    },
    markAllActivityRead: (memberId) => {
      const db = load();
      for (const a of db.activity) {
        if (!a.readBy.includes(memberId)) a.readBy = [...a.readBy, memberId];
      }
      save(db);
      return ok(undefined);
    },
  };
}
