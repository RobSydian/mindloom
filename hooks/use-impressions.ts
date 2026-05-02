import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateImpressionInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredImpressionsService } from '@/lib/impressions';
import { logAuthDiagnostics } from '@/lib/query/log-auth-diagnostics';
import { logQueryError } from '@/lib/query/log-query-error';

export const IMPRESSIONS_KEY = ['impressions'] as const;

export function useImpressions() {
  const { user, provider } = useAuthContext();
  const canQuery = Boolean(user?.uid && user.activeGroupId);

  const query = useQuery({
    queryKey: [...IMPRESSIONS_KEY, provider, user?.uid ?? 'anon', user?.activeGroupId ?? 'none'],
    queryFn: async () => {
      if (!user) return [];
      const svc = getConfiguredImpressionsService(user);
      return svc.getImpressions(user);
    },
    enabled: canQuery,
  });

  useEffect(() => {
    if (query.error) {
      const code = (query.error as { code?: string })?.code ?? 'unknown';
      logQueryError(
        'impressions',
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

export function useCreateImpression() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateImpressionInput) => {
      if (!user) throw new Error('You must be signed in to create an impression.');
      const svc = getConfiguredImpressionsService(user);
      return svc.createImpression(user, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: IMPRESSIONS_KEY }),
  });
}

export function useDeleteImpression() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('You must be signed in to delete an impression.');
      const svc = getConfiguredImpressionsService(user);
      return svc.deleteImpression(user, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: IMPRESSIONS_KEY }),
  });
}
