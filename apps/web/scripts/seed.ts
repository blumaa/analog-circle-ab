/**
 * Seeds the cloud Firestore + Auth with the demo data (mix: Aaron real, others fictional).
 * Re-runnable (idempotent upserts).
 *
 * Credentials: uses Application Default Credentials. Run one of:
 *   gcloud auth application-default login          (then GOOGLE_CLOUD_PROJECT=the-analog-circle-ic)
 *   OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *
 * Then: pnpm --filter web seed
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { DEV_PASSWORD } from "../src/data/devAccounts";
import { createSeed } from "../src/data/mock/fixtures";

const PROJECT_ID = "the-analog-circle-ic";

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const auth = getAuth();
const db = getFirestore();

/** Stores a record under its own id without repeating the id in the document. */
const byId = <T extends { id: string }>(coll: string, rows: T[]) =>
  rows.map(({ id, ...rest }) => ({ coll, id, data: rest as object }));

async function run() {
  const seed = createSeed(new Date());

  // Auth users: uid === member id, so the accounts link below is known up front.
  for (const m of seed.members) {
    try {
      await auth.createUser({ uid: m.id, email: m.email, password: DEV_PASSWORD });
      console.log(`created auth user ${m.id}`);
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code === "auth/uid-already-exists" || code === "auth/email-already-exists") {
        console.log(`auth user ${m.id} exists, skipping`);
      } else {
        throw e;
      }
    }
  }

  const writes = [
    ...byId("members", seed.members),
    ...seed.members.map((m) => ({ coll: "accounts", id: m.id, data: { memberId: m.id } })),
    ...byId("circles", seed.circles),
    ...byId("posts", seed.posts),
    ...byId("comments", seed.comments),
    ...seed.rsvps.map((r) => ({ coll: "rsvps", id: `${r.postId}_${r.memberId}`, data: r })),
    ...seed.prefs.map((p) => ({ coll: "prefs", id: p.memberId, data: p })),
    ...byId("activity", seed.activity),
    ...byId("feedback", seed.feedback),
  ];

  // Batched writes cap at 500 operations.
  for (let i = 0; i < writes.length; i += 500) {
    const batch = db.batch();
    for (const w of writes.slice(i, i + 500)) batch.set(db.collection(w.coll).doc(w.id), w.data);
    await batch.commit();
  }

  console.log(`Seed complete: ${writes.length} documents.`);
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
