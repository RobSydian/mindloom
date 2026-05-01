import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateImpressionInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredImpressionsService } from '@/lib/impressions';

export const IMPRESSIONS_KEY = ['impressions'] as const;

export function useImpressions() {
  const { user, provider } = useAuthContext();
  return useQuery({
    queryKey: [...IMPRESSIONS_KEY, provider, user?.uid ?? 'anon', user?.activeGroupId ?? 'none'],
    queryFn: async () => {
      if (!user) return [];
      const svc = getConfiguredImpressionsService(user);
      return svc.getImpressions(user);
    },
    enabled: Boolean(user),
  });
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
