import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { addMemberToCircle } from "../../lib/circles";
import { birthdayPostsDue } from "../../lib/birthday";
import { defaultPrefs } from "../../lib/prefs";
import type { DataSource } from "../dataSource";
import { assertPublishable, buildPost, byNewest, commentActivity, feedbackBody, isSelfAddressed, postRoute, replyParentId, type ActivityInput } from "../backendRules";
import { DEV_PASSWORD, devEmail } from "../devAccounts";
import type { Activity, Circle, Comment, Feedback, Member, Post, Prefs, Rsvp } from "../types";
import { fromRow, toRow } from "./rows";

/**
 * Postgres layout and access rules: supabase/migrations. One table per entity,
 * snake_case columns, mapped to the app's records by ./rows.
 *
 * Members are created by admins before they ever sign in, so a member id is
 * not an auth user id. The claim_member RPC links the auth user to the member
 * with the same verified email on first sign-in.
 */

type Row = Record<string, unknown>;
interface Result<T> {
  data: T | null;
  error: PostgrestError | null;
}

const IMAGES_BUCKET = "images";

const now = () => new Date().toISOString();

/** Returns the data (null when there is none) or throws the database error. */
async function run<T>(query: PromiseLike<Result<T>>): Promise<T | null> {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

/** Like run, for queries that always return data on success. */
async function must<T>(query: PromiseLike<Result<T>>): Promise<T> {
  const data = await run(query);
  if (data === null) throw new Error("The database returned no data");
  return data;
}

const one = <T>(row: Row) => fromRow<T>(row);
const many = <T>(rows: Row[]) => rows.map((r) => fromRow<T>(r));

export function createSupabaseDataSource(): DataSource {
  const sb: SupabaseClient = supabase();

  const list = async <T>(table: string): Promise<T[]> => many<T>(await must(sb.from(table).select("*")));

  const getOne = async <T>(table: string, id: string): Promise<T> =>
    one<T>(await must(sb.from(table).select("*").eq("id", id).single()));

  /** Updates one row and returns it. Fails when row level security hides or refuses it. */
  const update = async <T>(table: string, id: string, patch: object): Promise<T> =>
    one<T>(await must(sb.from(table).update(toRow(patch)).eq("id", id).select().single()));

  const insert = async <T>(table: string, record: object): Promise<T> =>
    one<T>(await must(sb.from(table).insert(toRow(record)).select().single()));

  const remove = async (table: string, id: string): Promise<void> => {
    await run(sb.from(table).delete().eq("id", id));
  };

  const getPrefs = async (memberId: string): Promise<Prefs> => {
    const row = await run(sb.from("prefs").select("*").eq("member_id", memberId).maybeSingle());
    return row ? { ...defaultPrefs(memberId), ...one<Prefs>(row) } : defaultPrefs(memberId);
  };

  const log = async (input: ActivityInput): Promise<void> => {
    if (isSelfAddressed(input)) return;
    await run(sb.from("activity").insert(toRow(input)));
  };

  return {
    // Auth
    async getCurrentMemberId() {
      // Waits for the stored session, and for a magic link session in the URL.
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      const memberId = await run(sb.rpc("claim_member"));
      // A valid email that belongs to no member is not a member session.
      if (!memberId) await sb.auth.signOut();
      return (memberId as string | null) ?? null;
    },
    async signInWithEmail(email) {
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw new Error(error.message);
    },
    async devSignInAs(memberId) {
      // Only works when the seed ran with --dev-passwords; see scripts/seed-supabase.ts.
      const { error } = await sb.auth.signInWithPassword({ email: devEmail(memberId), password: DEV_PASSWORD });
      if (error) throw new Error(error.message);
    },
    async signOut() {
      await sb.auth.signOut();
    },

    // Members
    listMembers: () => list<Member>("members"),
    async getMember(id) {
      const row = await run(sb.from("members").select("*").eq("id", id).maybeSingle());
      return row ? one<Member>(row) : null;
    },
    async createMember(input) {
      const member = await insert<Member>("members", { ...input, email: input.email.trim().toLowerCase() });
      await log({ type: "member_joined", actorId: member.id, subjectId: null, targetRoute: `/members/${member.id}` });
      return member;
    },
    updateMember(id, patch) {
      const { id: _id, ...rest } = patch;
      return update<Member>("members", id, rest);
    },
    // Circles, RSVPs, prefs and the account link follow in the database.
    deleteMember: (id) => remove("members", id),

    // Circles
    listCircles: () => list<Circle>("circles"),
    createCircle: (input) => insert<Circle>("circles", { ...input, memberIds: [input.createdBy] }),
    updateCircle: (id, patch) => update<Circle>("circles", id, patch),
    deleteCircle: (id) => remove("circles", id),
    async addCircleMember(circleId, memberId) {
      const before = await list<Circle>("circles");
      const after = addMemberToCircle(before, circleId, memberId);
      await Promise.all(
        after.filter((c, i) => c !== before[i]).map((c) => update("circles", c.id, { memberIds: c.memberIds })),
      );
    },
    async removeCircleMember(circleId, memberId) {
      const circle = await getOne<Circle>("circles", circleId);
      await update("circles", circleId, { memberIds: circle.memberIds.filter((id) => id !== memberId) });
    },

    // Posts
    async listPosts() {
      const [posts, members] = await Promise.all([list<Post>("posts"), list<Member>("members")]);
      const due = birthdayPostsDue(members, new Set(posts.map((p) => p.id)), new Date());
      if (due.length > 0) {
        // Deterministic ids make this idempotent when several clients race.
        await run(sb.from("posts").upsert(due.map(toRow), { ignoreDuplicates: true }));
      }
      return [...posts, ...due];
    },
    async createPost(input) {
      assertPublishable(await list<Circle>("circles"), input.authorId, input.publishedTo);
      const post = await insert<Post>("posts", buildPost(input, crypto.randomUUID(), now()));
      await log({ type: "post_created", actorId: post.authorId, subjectId: null, targetRoute: postRoute(post) });
      return post;
    },
    async updatePost(id, patch) {
      if (patch.publishedTo) {
        const [post, circles] = await Promise.all([getOne<Post>("posts", id), list<Circle>("circles")]);
        assertPublishable(circles, post.authorId, patch.publishedTo, post.publishedTo);
      }
      return update<Post>("posts", id, { ...patch, updatedAt: now() });
    },
    // Comments and RSVPs follow in the database.
    deletePost: (id) => remove("posts", id),
    setPostPinned: (id, pinned) => update<Post>("posts", id, { pinned }),
    // The database toggles the signed-in member, atomically.
    async togglePostReaction(postId, _memberId, emoji) {
      await run(sb.rpc("toggle_post_reaction", { post_id: postId, emoji }));
    },

    // Comments
    listAllComments: () => list<Comment>("comments"),
    async listComments(postId) {
      return many<Comment>(await must(sb.from("comments").select("*").eq("post_id", postId).order("created_at")));
    },
    async addComment(postId, authorId, body, parentId) {
      const post = await getOne<Post>("posts", postId);
      const parent = parentId ? await getOne<Comment>("comments", parentId) : null;
      // The database keeps the post's comment count.
      const comment = await insert<Comment>("comments", {
        postId,
        parentId: replyParentId(parent),
        authorId,
        body,
        createdAt: now(),
        updatedAt: null,
        reactions: {},
      });
      await log(commentActivity(post, parent, authorId));
      return comment;
    },
    updateComment: (id, body) => update<Comment>("comments", id, { body, updatedAt: now() }),
    // Replies and the comment count follow in the database.
    deleteComment: (id) => remove("comments", id),
    async toggleCommentReaction(commentId, _memberId, emoji) {
      await run(sb.rpc("toggle_comment_reaction", { comment_id: commentId, emoji }));
    },

    // RSVPs
    listRsvps: () => list<Rsvp>("rsvps"),
    async setRsvp(postId, memberId, status) {
      const rsvp: Rsvp = { postId, memberId, status, updatedAt: now() };
      await run(sb.from("rsvps").upsert(toRow(rsvp)));
    },

    // Prefs
    getPrefs,
    async updatePrefs(memberId, patch) {
      const current = await getPrefs(memberId);
      const next: Prefs = { ...current, ...patch, memberId };
      await run(sb.from("prefs").upsert(toRow(next)));
      return next;
    },

    // Notifications
    async listActivity() {
      return byNewest(await list<Activity>("activity"));
    },
    async markActivityRead(id) {
      await run(sb.rpc("mark_activity_read", { activity_id: id }));
    },
    async markAllActivityRead() {
      await run(sb.rpc("mark_activity_read"));
    },

    // Feedback
    sendFeedback: (authorId, body) =>
      insert<Feedback>("feedback", { authorId, body: feedbackBody(body), createdAt: now() }),
    async listFeedback() {
      return byNewest(await list<Feedback>("feedback"));
    },
    deleteFeedback: (id) => remove("feedback", id),

    // Images
    async uploadImage(file) {
      const { data } = await sb.auth.getUser();
      if (!data.user) throw new Error("Sign in to upload images");
      const path = `${data.user.id}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await sb.storage.from(IMAGES_BUCKET).upload(path, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      return sb.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    },
  };
}
