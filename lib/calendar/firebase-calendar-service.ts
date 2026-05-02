import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import type { AppUser, CalendarEvent, CreateCalendarEventInput } from '@/types';
import { getFirebaseDb } from '@/lib/firebase/firebaseConfig';
import { normalizeDateLike } from '@/lib/firebase/normalize';
import type { CalendarService } from './calendar-service';

type FirestoreCalendarEvent = Omit<CalendarEvent, 'id'> & { groupId: string; updatedAt: string };

function requireGroup(user: AppUser): string {
  if (!user.activeGroupId) throw new Error('No active group selected.');
  return user.activeGroupId;
}

export const firebaseCalendarService: CalendarService = {
  async getEvents(user) {
    const db = getFirebaseDb();
    const groupId = requireGroup(user);
    const q = query(collection(db, 'calendarEvents'), where('groupId', '==', groupId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => {
        const data = d.data() as Omit<CalendarEvent, 'id'>;
        return {
          id: d.id,
          ...data,
          date: normalizeDateLike(data.date).slice(0, 10),
          createdAt: normalizeDateLike(data.createdAt),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async createEvent(user, data) {
    const db = getFirebaseDb();
    const groupId = requireGroup(user);
    const now = new Date().toISOString();
    const payload: FirestoreCalendarEvent = {
      ...data,
      authorId: user.uid,
      groupId,
      createdAt: now,
      updatedAt: now,
    };
    const ref = await addDoc(collection(db, 'calendarEvents'), {
      ...payload,
      createdAtServer: serverTimestamp(),
      updatedAtServer: serverTimestamp(),
    });
    return { id: ref.id, ...payload };
  },

  async deleteEvent(user, id) {
    const db = getFirebaseDb();
    const groupId = requireGroup(user);
    const ref = doc(db, 'calendarEvents', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as FirestoreCalendarEvent;
    if (data.authorId !== user.uid) {
      throw new Error('Only the event creator can delete this item.');
    }
    if (data.groupId !== groupId) {
      throw new Error('Event does not belong to your active group.');
    }
    await deleteDoc(ref);
  },
};
