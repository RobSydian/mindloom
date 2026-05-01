import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCalendarEventInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredCalendarService } from '@/lib/calendar';

export const EVENTS_KEY = ['events'] as const;

export function useCalendarEvents() {
  const { user, provider } = useAuthContext();
  return useQuery({
    queryKey: [...EVENTS_KEY, provider, user?.uid ?? 'anon', user?.activeGroupId ?? 'none'],
    queryFn: async () => {
      if (!user) return [];
      return getConfiguredCalendarService(user).getEvents(user);
    },
    enabled: Boolean(user),
  });
}

export function useCreateEvent() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCalendarEventInput) => {
      if (!user) throw new Error('You must be signed in to create an event.');
      return getConfiguredCalendarService(user).createEvent(user, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}

export function useDeleteEvent() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('You must be signed in to delete an event.');
      return getConfiguredCalendarService(user).deleteEvent(user, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENTS_KEY }),
  });
}
