# Firebase backend

Project: **the-analog-circle-ic** (free Spark tier, $0). Owner account: **desmond.blume@gmail.com**.
Console: https://console.firebase.google.com/project/the-analog-circle-ic/overview

## Already done (in code + cloud)
- Firebase project + Web app created; config in `apps/web/.env` (`VITE_FB_*` — publishable client keys).
- Firestore database (region `eur3`) initialized; **security rules deployed** (`firestore.rules`): authenticated reads; writes guarded by ownership (members write own profile; events by creator/host; rsvps/loop/wall by author; wall delete by author or wall owner).
- Email/Password auth provider enabled.
- `apps/web/src/data/firebase/firebaseDataSource.ts` — full `DataSource` implementation (Firestore CRUD + email-link auth + dev-bypass email/password sign-in).
- Backend toggle in `apps/web/src/data/index.ts` driven by `VITE_BACKEND` (`apps/web/.env`). Default `mock` (localStorage) so the app runs with zero setup.
- Seed script `apps/web/scripts/seed.ts` (`pnpm --filter web seed`).

## Two manual steps to go live on Firebase

### 1. Enable passwordless email-link sign-in (console, ~30s)
Auth → Sign-in method → Email/Password → enable **"Email link (passwordless sign-in)"** → Save.
(The Email/Password provider is already on; this is the passwordless sub-toggle the API can't flip.)

### 2. Seed the database (needs admin credentials, one time)
The seed uses the Admin SDK. Pick ONE credential source:

- **Service account key** (simplest here — `gcloud` isn't installed):
  Console → Project settings → Service accounts → **Generate new private key** → save as `serviceAccount.json` (keep it out of git).
  ```
  GOOGLE_APPLICATION_CREDENTIALS=/abs/path/serviceAccount.json pnpm --filter web seed
  ```
- **or gcloud ADC** (if you install gcloud): `gcloud auth application-default login` then `GOOGLE_CLOUD_PROJECT=the-analog-circle-ic pnpm --filter web seed`.

The seed creates Auth users (uid = member id, password `analog-demo-pw` for dev sign-in) and writes all demo docs (mix data: Aaron real, others fictional).

## Flip to Firebase
In `apps/web/.env` set `VITE_BACKEND=firebase`, restart `pnpm --filter web dev`.
Dev sign-in uses `aaron@…` + `analog-demo-pw`; real users get the magic-link email.
Revert by setting `VITE_BACKEND=mock`.
