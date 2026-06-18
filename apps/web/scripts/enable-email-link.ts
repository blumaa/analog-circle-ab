/**
 * Enables passwordless email-link sign-in on the project via the Identity
 * Platform Admin API (so no console toggle is needed).
 * Run: GOOGLE_APPLICATION_CREDENTIALS=key.json pnpm --filter web exec tsx scripts/enable-email-link.ts
 */
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = "the-analog-circle-ic";

async function run() {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token;

  const url =
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${PROJECT_ID}/config` +
    `?updateMask=signIn.email.enabled,signIn.email.passwordRequired`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    // passwordRequired:false => email-link (passwordless) enabled, password still allowed.
    body: JSON.stringify({ signIn: { email: { enabled: true, passwordRequired: false } } }),
  });

  console.log("status", res.status);
  console.log(await res.text());
}

run().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
