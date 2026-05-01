import type { CalendarService } from './calendar-service';
import { createEvent, deleteEvent, getEvents } from '@/lib/mock/calendar';

export const mockCalendarService: CalendarService = {
  async getEvents() {
    return getEvents();
  },
  async createEvent(_user, data) {
    return createEvent(data);
  },
  async deleteEvent(_user, id) {
    return deleteEvent(id);
  },
};
