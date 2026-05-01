import type { CalendarEvent, CreateCalendarEventInput } from '@/types';
import { SEED_EVENTS } from './seed';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let store: CalendarEvent[] = [...SEED_EVENTS];

export async function getEvents(): Promise<CalendarEvent[]> {
  await delay();
  return [...store].sort((a, b) => a.date.localeCompare(b.date));
}

export async function createEvent(
  data: CreateCalendarEventInput
): Promise<CalendarEvent> {
  await delay();
  const event: CalendarEvent = {
    ...data,
    id: `evt_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store = [...store, event];
  return event;
}

export async function deleteEvent(id: string): Promise<void> {
  await delay(300);
  store = store.filter((e) => e.id !== id);
}
