#!/usr/bin/env node

/**
 * Seeds Firestore from a payload JSON (not firestore.schema.json — that file is documentation).
 *
 * Supported top-level arrays: users, groups, groupInvites, impressions, calendarEvents, goals,
 * joinRequests (optional — docs at groups/{groupId}/joinRequests/{requesterUid}).
 *
 * Run: pnpm seed:firestore -- --key /path/to/serviceAccount.json [--seed ./firebase/seed.multi-group.payload.json]
 */

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

function argValue(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function requireArg(flag, helpText) {
  const value = argValue(flag);
  if (!value) {
    throw new Error(`Missing ${flag}. ${helpText}`);
  }
  return value;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function validateSeedReferences(seed) {
  const knownUserUids = new Set((seed.users ?? []).map((u) => u.uid));
  const knownGroupIds = new Set((seed.groups ?? []).map((g) => g.id));
  const groupById = new Map((seed.groups ?? []).map((g) => [g.id, g]));
  const errors = [];

  const ensureKnownUid = (uid, label) => {
    if (!uid) return;
    if (!knownUserUids.has(uid)) {
      errors.push(`${label} references unknown uid "${uid}" (not found in seed.users[])`);
    }
  };

  for (const g of seed.groups ?? []) {
    ensureKnownUid(g.createdBy, `groups/${g.id}.createdBy`);
    for (const uid of g.memberIds ?? []) {
      ensureKnownUid(uid, `groups/${g.id}.memberIds[]`);
    }
  }

  for (const i of seed.groupInvites ?? []) {
    ensureKnownUid(i.createdBy, `groupInvites/${i.id}.createdBy`);
    ensureKnownUid(i.acceptedBy, `groupInvites/${i.id}.acceptedBy`);
  }

  for (const imp of seed.impressions ?? []) {
    ensureKnownUid(imp.authorId, `impressions/${imp.id}.authorId`);
  }

  for (const e of seed.calendarEvents ?? []) {
    ensureKnownUid(e.authorId, `calendarEvents/${e.id}.authorId`);
  }

  for (const g of seed.goals ?? []) {
    ensureKnownUid(g.authorId, `goals/${g.id}.authorId`);
  }

  for (const jr of seed.joinRequests ?? []) {
    if (jr.groupId && !knownGroupIds.has(jr.groupId)) {
      errors.push(`joinRequests references unknown groupId "${jr.groupId}"`);
    }
    ensureKnownUid(jr.requesterUid, `joinRequests ${jr.groupId}/joinRequests.requesterUid`);
    const g = groupById.get(jr.groupId);
    if (g && (g.memberIds ?? []).includes(jr.requesterUid)) {
      errors.push(
        `joinRequests: requester "${jr.requesterUid}" is already in memberIds for groups/${jr.groupId} (remove them or drop this join request)`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Seed consistency validation failed:\n- ${errors.join('\n- ')}`);
  }
}

async function resolveSeedUsers(auth, users, strictAuthUsers) {
  const resolvedUsers = [];
  const uidMap = new Map();

  for (const u of users ?? []) {
    const originalUid = u.uid;
    let resolvedUid = u.uid;
    let resolution = 'seed-uid';

    if (u.email) {
      try {
        const authUser = await auth.getUserByEmail(String(u.email).toLowerCase());
        resolvedUid = authUser.uid;
        resolution = 'auth-email';
      } catch (error) {
        if (strictAuthUsers) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to resolve Firebase Auth user by email "${u.email}": ${message}`);
        }
        console.warn(
          `[seed] Could not resolve "${u.email}" in Firebase Auth. Falling back to seed uid "${u.uid}".`
        );
      }
    }

    uidMap.set(originalUid, resolvedUid);
    resolvedUsers.push({
      ...u,
      uid: resolvedUid,
      __originalUid: originalUid,
      __resolution: resolution,
    });
  }

  return { resolvedUsers, uidMap };
}

async function run() {
  const keyPath = requireArg(
    '--key',
    'Pass your downloaded service account file path, e.g. --key ~/Downloads/my-project-firebase-adminsdk.json'
  );
  const seedPath = argValue(
    '--seed',
    path.join(process.cwd(), 'firebase', 'seed.multi-group.payload.json')
  );
  const strictAuthUsers = !hasFlag('--allow-missing-auth-users');

  const resolvedKeyPath = path.resolve(keyPath);
  const resolvedSeedPath = path.resolve(seedPath);

  if (!fs.existsSync(resolvedKeyPath)) {
    throw new Error(`Service account key file not found: ${resolvedKeyPath}`);
  }
  if (!fs.existsSync(resolvedSeedPath)) {
    throw new Error(`Seed payload file not found: ${resolvedSeedPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(resolvedKeyPath, 'utf8'));
  const seed = JSON.parse(fs.readFileSync(resolvedSeedPath, 'utf8'));
  validateSeedReferences(seed);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const auth = admin.auth();
  const db = admin.firestore();
  const { FieldValue, Timestamp } = admin.firestore;

  console.log(`Seeding Firestore using: ${resolvedSeedPath}`);
  console.log(
    `[seed] UID resolution mode: ${
      strictAuthUsers
        ? 'strict (fail if seed user email is missing in Firebase Auth)'
        : 'lenient (fallback to seed uid when email is missing in Firebase Auth; use only for local test data)'
    }`
  );

  const { resolvedUsers, uidMap } = await resolveSeedUsers(auth, seed.users ?? [], strictAuthUsers);
  const mapUid = (uid) => (uid ? uidMap.get(uid) ?? uid : uid);

  for (const u of resolvedUsers) {
    if (u.__originalUid !== u.uid) {
      console.log(`[seed] remapped ${u.email}: ${u.__originalUid} -> ${u.uid}`);
    } else {
      console.log(`[seed] using uid for ${u.email}: ${u.uid} (${u.__resolution})`);
    }
  }

  // groups
  for (const g of seed.groups ?? []) {
    await db.collection('groups').doc(g.id).set(
      {
        name: g.name,
        createdBy: mapUid(g.createdBy),
        memberIds: (g.memberIds ?? []).map(mapUid),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted groups/${g.id}`);
  }

  // users
  for (const u of resolvedUsers) {
    await db.collection('users').doc(u.uid).set(
      {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL ?? null,
        activeGroupId: u.activeGroupId ?? null,
        sharedGroupId: u.activeGroupId ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted users/${u.uid}`);
  }

  // groupInvites
  for (const i of seed.groupInvites ?? []) {
    const expiresAtDate = toDate(i.expiresAt);
    const acceptedAtDate = toDate(i.acceptedAt);

    await db.collection('groupInvites').doc(i.id).set(
      {
        groupId: i.groupId,
        emailLower: i.emailLower,
        role: i.role ?? 'member',
        status: i.status ?? 'pending',
        tokenHash: i.tokenHash,
        expiresAt: expiresAtDate ? Timestamp.fromDate(expiresAtDate) : null,
        createdBy: mapUid(i.createdBy),
        createdAt: FieldValue.serverTimestamp(),
        acceptedBy: i.acceptedBy ? mapUid(i.acceptedBy) : null,
        acceptedAt: acceptedAtDate ? Timestamp.fromDate(acceptedAtDate) : null,
      },
      { merge: true }
    );
    console.log(`Upserted groupInvites/${i.id}`);
  }

  // impressions
  for (const imp of seed.impressions ?? []) {
    await db.collection('impressions').doc(imp.id).set(
      {
        authorId: mapUid(imp.authorId),
        groupId: imp.groupId,
        placeName: imp.placeName,
        description: imp.description ?? '',
        rating: imp.rating ?? 0,
        images: imp.images ?? [],
        location: imp.location ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted impressions/${imp.id}`);
  }

  // calendarEvents (optional)
  for (const e of seed.calendarEvents ?? []) {
    await db.collection('calendarEvents').doc(e.id).set(
      {
        authorId: mapUid(e.authorId),
        groupId: e.groupId,
        title: e.title,
        description: e.description ?? '',
        date: e.date,
        time: e.time ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted calendarEvents/${e.id}`);
  }

  // goals (optional)
  for (const g of seed.goals ?? []) {
    await db.collection('goals').doc(g.id).set(
      {
        authorId: mapUid(g.authorId),
        groupId: g.groupId,
        title: g.title,
        description: g.description ?? '',
        period: g.period,
        periodLabel: g.periodLabel,
        status: g.status,
        statusReason: g.statusReason ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted goals/${g.id}`);
  }

  // joinRequests under groups/{groupId}/joinRequests/{requesterUid} (optional)
  for (const jr of seed.joinRequests ?? []) {
    const reqUid = mapUid(jr.requesterUid);
    const status = jr.status ?? 'pending';
    const createdAtIso = new Date().toISOString();
    await db
      .collection('groups')
      .doc(jr.groupId)
      .collection('joinRequests')
      .doc(reqUid)
      .set(
        {
          requesterUid: reqUid,
          status,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdAtIso,
        },
        { merge: true }
      );
    console.log(`Upserted groups/${jr.groupId}/joinRequests/${reqUid}`);
  }

  console.log('Seed completed.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
