import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import type {
  AppUser,
  CreateGoalInput,
  Goal,
  GoalPeriod,
  GoalStatus,
  UpdateGoalStatusInput,
} from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import { normalizeDateLike } from '@/lib/firebase/normalize';
import type { GoalsService } from './goals-service';

type FirestoreGoal = Omit<Goal, 'id'> & { groupId: string };

function requireGroup(user: AppUser): string {
  if (!user.activeGroupId) throw new Error('No active group selected.');
  return user.activeGroupId;
}

export const firebaseGoalsService: GoalsService = {
  async getGoals(user, period?: GoalPeriod) {
    const db = getFirebaseDb();
    const groupId = requireGroup(user);
    const base = [where('groupId', '==', groupId)] as const;
    const q = period
      ? query(collection(db, 'goals'), where('period', '==', period), ...base)
      : query(collection(db, 'goals'), ...base);
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data() as Omit<Goal, 'id'>;
        return {
          id: d.id,
          ...data,
          createdAt: normalizeDateLike(data.createdAt),
          updatedAt: normalizeDateLike(data.updatedAt),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createGoal(user, data: CreateGoalInput) {
    const db = getFirebaseDb();
    const now = new Date().toISOString();
    const goal: FirestoreGoal = {
      ...data,
      authorId: user.uid,
      groupId: requireGroup(user),
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'goals'), {
      ...goal,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });
    return { id: ref.id, ...goal };
  },

  async updateGoalStatus(user, input: UpdateGoalStatusInput) {
    const db = getFirebaseDb();
    const ref = doc(db, 'goals', input.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Goal not found.');
    const goal = snap.data() as FirestoreGoal;
    if (goal.authorId !== user.uid) {
      throw new Error('Only the goal creator can update status.');
    }
    const blockedLike: GoalStatus[] = ['blocked', 'cancelled'];
    if (blockedLike.includes(input.status) && !input.reason) {
      throw new Error('A reason is required for blocked/cancelled status.');
    }

    const updated: FirestoreGoal = {
      ...goal,
      status: input.status,
      statusReason: input.reason ?? null,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(ref, {
      status: updated.status,
      statusReason: updated.statusReason,
      updatedAt: updated.updatedAt,
      updatedAtServer: serverTimestamp(),
    });

    return { id: input.id, ...updated };
  },

  async deleteGoal(user, id: string) {
    const db = getFirebaseDb();
    const ref = doc(db, 'goals', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const goal = snap.data() as FirestoreGoal;
    if (goal.authorId !== user.uid) {
      throw new Error('Only the goal creator can delete this item.');
    }
    await deleteDoc(ref);
  },
};
