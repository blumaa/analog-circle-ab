/** Demo sign-in email for a seeded member. Shared by the fixtures, the Firebase seed and dev sign-in. */
export function devEmail(memberId: string): string {
  return memberId === "aaron" ? "blumaa@gmail.com" : `${memberId}@example.com`;
}

/** Password the Firebase seed gives every demo Auth user. Dev sign-in only. */
export const DEV_PASSWORD = "analog-demo-pw";
