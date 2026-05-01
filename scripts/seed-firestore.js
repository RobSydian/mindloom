#!/usr/bin/env node

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

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = admin.firestore();
  const { FieldValue, Timestamp } = admin.firestore;

  console.log(`Seeding Firestore using: ${resolvedSeedPath}`);

  // groups
  for (const g of seed.groups ?? []) {
    await db.collection('groups').doc(g.id).set(
      {
        name: g.name,
        createdBy: g.createdBy,
        memberIds: g.memberIds,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Upserted groups/${g.id}`);
  }

  // users
  for (const u of seed.users ?? []) {
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
        createdBy: i.createdBy,
        createdAt: FieldValue.serverTimestamp(),
        acceptedBy: i.acceptedBy ?? null,
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
        authorId: imp.authorId,
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
        authorId: e.authorId,
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
        authorId: g.authorId,
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

  console.log('Seed completed.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
