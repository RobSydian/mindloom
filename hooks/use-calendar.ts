import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateCalendarEventInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredCalendarService } from '@/lib/calendar';
import { logAuthDiagnostics } from '@/lib/query/log-auth-diagnostics';
import { logQueryError } from '@/lib/query/log-query-error';

export const EVENTS_KEY = ['events'] as const;

export function useCalendarEvents() {
  const { user, provider } = useAuthContext();
  const canQuery = Boolean(user?.uid && user.activeGroupId);

  const query = useQuery({
    queryKey: [...EVENTS_KEY, provider, user?.uid ?? 'anon', user?.activeGroupId ?? 'none'],
    queryFn: async () => {
      if (!user) return [];
      return getConfiguredCalendarService(user).getEvents(user);
    },
    enabled: canQuery,
  });

  useEffect(() => {
    if (query.error) {
      const code = (query.error as { code?: string })?.code ?? 'unknown';
      logQueryError(
        'calendar',
        query.error,
        `${provider}:${user?.uid ?? 'anon'}:${user?.activeGroupId ?? 'none'}`
      );
      if (code === 'permission-denied') {
        void logAuthDiagnostics(user ?? null);
      }
    }
  }, [provider, query.error, user?.activeGroupId, user?.uid]);

  return query;
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
