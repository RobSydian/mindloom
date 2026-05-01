import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import type { AppUser, CreateImpressionInput, Impression } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import type { ImpressionsService } from './impressions-service';

type FirestoreImpression = Omit<Impression, 'id'> & { groupId: string };

function assertGroupId(user: AppUser): string {
  if (!user.activeGroupId) {
    throw new Error(
      'No activeGroupId set on user profile. Please assign users/{uid}.activeGroupId.'
    );
  }
  return user.activeGroupId;
}

function mapDocToImpression(id: string, data: FirestoreImpression): Impression {
  return {
    id,
    authorId: data.authorId,
    placeName: data.placeName,
    description: data.description,
    rating: data.rating,
    images: data.images ?? [],
    location: data.location ?? null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export const firebaseImpressionsService: ImpressionsService = {
  async getImpressions(user) {
    const db = getFirebaseDb();
    const groupId = assertGroupId(user);
    const impressionsRef = collection(db, 'impressions');
    const q = query(
      impressionsRef,
      where('groupId', '==', groupId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) =>
      mapDocToImpression(d.id, d.data() as FirestoreImpression)
    );
  },

  async createImpression(user, data) {
    const db = getFirebaseDb();
    const groupId = assertGroupId(user);
    const now = new Date().toISOString();
    const payload: FirestoreImpression = {
      ...data,
      authorId: user.uid,
      groupId,
      createdAt: now,
      updatedAt: now,
    };

    const ref = await addDoc(collection(db, 'impressions'), {
      ...payload,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });
    return mapDocToImpression(ref.id, payload);
  },

  async deleteImpression(user, id) {
    const groupId = assertGroupId(user);
    const db = getFirebaseDb();
    const ref = doc(db, 'impressions', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const item = snap.data() as FirestoreImpression;
    if (item.authorId !== user.uid) {
      throw new Error('Only the impression creator can delete this item.');
    }
    if (item.groupId !== groupId) {
      throw new Error('Impression does not belong to your active group.');
    }
    await deleteDoc(ref);
  },
};
