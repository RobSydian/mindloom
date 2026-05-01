# Firebase Setup Guide (mindloom)

This project now supports two auth providers:

- `mock` (default, no Firebase needed)
- `firebase` (real auth and user profile handling)

The app auto-falls back to mock mode if Firebase env keys are missing.

## 1) What you need to give me

Send these values from your Firebase project:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Also confirm:

- Firebase Authentication enabled with **Email/Password**
- Whether you want one shared group per couple/family (current model assumes this)

## 2) Local configuration

Create `.env` from `.env.example` and set:

```bash
EXPO_PUBLIC_AUTH_PROVIDER=firebase
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Restart Expo after changing env variables.

## 3) Firestore data structure

Schema artifacts are in:

- `firebase/firestore.schema.json`
- `firebase/firestore.rules`
- `firebase/firestore.indexes.json`
- `firebase/seed.payload.json`
- `firebase/seed.multi-group.payload.json` (user can belong to multiple groups)

Collections:

- `users/{uid}`
- `groups/{groupId}`
- `groupInvites/{inviteId}`
- `impressions/{id}`
- `calendarEvents/{id}`
- `goals/{id}`

## 4) Bootstrap/migration payload

Use `firebase/seed.payload.json`:

1. Replace `REPLACE_WITH_AUTH_UID_*` with real auth user UIDs.
2. Create `groups/group_01`.
3. Create `users/{uid}` docs with `activeGroupId: "group_01"`.
4. Import or create starter docs in `impressions`, `calendarEvents`, `goals`.

For multi-group testing (`User1` in `group_01` and `group_02`), use:

- `firebase/seed.multi-group.payload.json`

## 5) Important behavior

- Auth is now provider-based and selected by env (`mock`/`firebase`).
- On Firebase sign-in, the app auto-creates a `users/{uid}` profile document if missing.
- Feature data (impressions/calendar/goals) now supports Firebase services with owner-only mutations.
- Invitations are email-link based and resolve through the `invite-accept` route.

## 6) Admin SDK seed import (recommended)

If you downloaded a Firebase Admin service key JSON, do this:

1. Keep that key outside git (already ignored by `.gitignore` patterns).
2. Replace placeholder UIDs in `firebase/seed.multi-group.payload.json`.
3. Run:

```bash
pnpm seed:firestore -- --key "/absolute/path/to/your-service-account.json" --seed "./firebase/seed.multi-group.payload.json"
```

If `--seed` is omitted, the script defaults to `firebase/seed.multi-group.payload.json`.

