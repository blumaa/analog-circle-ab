/**
 * Seeds the Supabase project with the demo data from createSeed().
 * Re-runnable: auth users are reused by email and every table is upserted.
 *
 * Needs SUPABASE_URL and SUPABASE_SECRET_KEY (service role) in apps/web/.env.local.
 * That key bypasses row level security: keep it out of the browser and out of git.
 *
 *   pnpm --filter web seed:supabase                 magic-link sign-in only
 *   pnpm --filter web seed:supabase --dev-passwords also sets DEV_PASSWORD on every seeded
 *                                                   user so "Dev sign-in" works. The password
 *                                                   is in the repo: never use it on a real project.
 */
import { createClient } from "@supabase/supabase-js";
import { DEV_PASSWORD } from "../src/data/devAccounts";
import { createSeed } from "../src/data/mock/fixtures";
import { toRow } from "../src/data/supabase/rows";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) throw new Error("Set SUPABASE_URL and SUPABASE_SECRET_KEY in apps/web/.env.local");

const devPasswords = process.argv.includes("--dev-passwords");
const sb = createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });

/** Throws the error of a Supabase call that failed. */
function check(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

/** Existing auth users by lowercase email. */
async function authUsersByEmail(): Promise<Map<string, string>> {
  const users = new Map<string, string>();
  for (let page = 1; ; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    check(error);
    const batch = data.users;
    for (const u of batch) if (u.email) users.set(u.email.toLowerCase(), u.id);
    if (batch.length < 1000) return users;
  }
}

/** The auth user id for each member, creating confirmed users that do not exist yet. */
async function ensureAuthUsers(members: { id: string; email: string }[]): Promise<{ uid: string; member_id: string }[]> {
  const existing = await authUsersByEmail();
  const password = devPasswords ? DEV_PASSWORD : undefined;
  const links = [];
  for (const m of members) {
    let uid = existing.get(m.email);
    if (uid) {
      if (password) check((await sb.auth.admin.updateUserById(uid, { password })).error);
    } else {
      const { data, error } = await sb.auth.admin.createUser({ email: m.email, email_confirm: true, password });
      check(error);
      uid = data.user!.id;
      console.log(`created auth user for ${m.id}`);
    }
    links.push({ uid, member_id: m.id });
  }
  return links;
}

const upsert = async (table: string, rows: object[], onConflict?: string) =>
  check((await sb.from(table).upsert(rows.map(toRow), { onConflict })).error);

async function run() {
  const seed = createSeed(new Date());
  // Top-level comments first so replies find their parent.
  const comments = seed.comments.toSorted((a, b) => Number(a.parentId !== null) - Number(b.parentId !== null));

  await upsert("members", seed.members);
  await upsert("accounts", await ensureAuthUsers(seed.members), "member_id");
  await upsert("circles", seed.circles);
  await upsert("posts", seed.posts);
  await upsert("comments", comments);
  // New comments bumped the counters; restore the seeded counts.
  await upsert("posts", seed.posts);
  await upsert("rsvps", seed.rsvps, "post_id,member_id");
  await upsert("prefs", seed.prefs, "member_id");
  await upsert("activity", seed.activity);
  await upsert("feedback", seed.feedback);

  const total = Object.values(seed).reduce((n, v) => n + (Array.isArray(v) ? v.length : 0), 0);
  console.log(`Seed complete: ${total} rows${devPasswords ? ", dev passwords set" : ""}.`);
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
