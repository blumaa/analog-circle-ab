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
import {
  groups,
  members,
  memberships,
  events,
  rsvps,
  loopPosts,
  wallPosts,
  activity,
} from "../src/data/mock/fixtures";

const PROJECT_ID = "the-analog-circle-ic";
const DEV_PASSWORD = "analog-demo-pw";

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const auth = getAuth();
const db = getFirestore();

async function run() {
  // Auth users — uid === member id so the app maps auth uid → member doc.
  for (const m of members) {
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

  const set = async (coll: string, id: string, data: object) => {
    await db.collection(coll).doc(id).set(data);
  };

  for (const m of members) {
    const { id, ...rest } = m;
    await set("members", id, rest);
  }
  for (const g of groups) {
    const { id, ...rest } = g;
    await set("groups", id, rest);
  }
  for (const ms of memberships) {
    await set("memberships", `${ms.memberId}_${ms.groupId}`, ms);
  }
  for (const e of events) {
    const { id, ...rest } = e;
    await set("events", id, rest);
  }
  for (const r of rsvps) {
    await set("rsvps", `${r.eventId}_${r.memberId}`, r);
  }
  for (const p of loopPosts) {
    const { id, ...rest } = p;
    await set("loopPosts", id, rest);
  }
  for (const w of wallPosts) {
    const { id, ...rest } = w;
    await set("wallPosts", id, rest);
  }
  for (const a of activity) {
    const { id, ...rest } = a;
    await set("activity", id, rest);
  }

  console.log("Seed complete.");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
