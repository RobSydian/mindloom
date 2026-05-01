import { SEED_EVENTS, SEED_GOALS, SEED_IMPRESSIONS } from '@/lib/mock/seed';

const SHARED_GROUP_ID = 'group_01';

/**
 * Replace these UIDs with real Firebase Auth user UIDs.
 */
export const AUTH_UID_1 = 'REPLACE_WITH_AUTH_UID_1';
export const AUTH_UID_2 = 'REPLACE_WITH_AUTH_UID_2';

const authorMap: Record<string, string> = {
  user_01: AUTH_UID_1,
  user_02: AUTH_UID_2,
};

export const seedBundle = {
  group: {
    id: SHARED_GROUP_ID,
    name: 'Mindloom Shared Space',
    createdBy: AUTH_UID_1,
    memberIds: [AUTH_UID_1, AUTH_UID_2],
  },
  users: [
    {
      uid: AUTH_UID_1,
      email: 'alex@mindloom.app',
      displayName: 'Alex',
      photoURL: null,
      activeGroupId: SHARED_GROUP_ID,
    },
    {
      uid: AUTH_UID_2,
      email: 'sam@mindloom.app',
      displayName: 'Sam',
      photoURL: null,
      activeGroupId: SHARED_GROUP_ID,
    },
  ],
  groupInvites: [
    {
      id: 'inv_01',
      groupId: SHARED_GROUP_ID,
      emailLower: 'sam@mindloom.app',
      role: 'member',
      status: 'pending',
      tokenHash: 'REPLACE_WITH_SHA256_HASH',
      expiresAt: '2026-12-31T00:00:00.000Z',
      createdBy: AUTH_UID_1,
      acceptedBy: null,
      acceptedAt: null,
    },
  ],
  impressions: SEED_IMPRESSIONS.map((i) => ({
    ...i,
    authorId: authorMap[i.authorId] ?? i.authorId,
    groupId: SHARED_GROUP_ID,
  })),
  calendarEvents: SEED_EVENTS.map((e) => ({
    ...e,
    authorId: authorMap[e.authorId] ?? e.authorId,
    groupId: SHARED_GROUP_ID,
    updatedAt: e.createdAt,
  })),
  goals: SEED_GOALS.map((g) => ({
    ...g,
    authorId: authorMap[g.authorId] ?? g.authorId,
    groupId: SHARED_GROUP_ID,
  })),
};
