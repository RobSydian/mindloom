import type { AppUser, CalendarEvent, CreateCalendarEventInput } from '@/types';

export interface CalendarService {
  getEvents(user: AppUser): Promise<CalendarEvent[]>;
  createEvent(user: AppUser, data: CreateCalendarEventInput): Promise<CalendarEvent>;
  deleteEvent(user: AppUser, id: string): Promise<void>;
}
