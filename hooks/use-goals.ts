import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateGoalInput, GoalPeriod, UpdateGoalStatusInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredGoalsService } from '@/lib/goals';
import { logAuthDiagnostics } from '@/lib/query/log-auth-diagnostics';
import { logQueryError } from '@/lib/query/log-query-error';

export const GOALS_KEY = ['goals'] as const;

export function useGoals(period?: GoalPeriod) {
  const { user, provider } = useAuthContext();
  const canQuery = Boolean(user?.uid && user.activeGroupId);

  const query = useQuery({
    queryKey: [
      ...GOALS_KEY,
      provider,
      user?.uid ?? 'anon',
      user?.activeGroupId ?? 'none',
      period ?? 'all',
    ],
    queryFn: async () => {
      if (!user) return [];
      return getConfiguredGoalsService(user).getGoals(user, period);
    },
    enabled: canQuery,
  });

  useEffect(() => {
    if (query.error) {
      const code = (query.error as { code?: string })?.code ?? 'unknown';
      logQueryError(
        'goals',
        query.error,
        `${provider}:${user?.uid ?? 'anon'}:${user?.activeGroupId ?? 'none'}:${period ?? 'all'}`
      );
      if (code === 'permission-denied') {
        void logAuthDiagnostics(user ?? null);
      }
    }
  }, [period, provider, query.error, user?.activeGroupId, user?.uid]);

  return query;
}

export function useCreateGoal() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGoalInput) => {
      if (!user) throw new Error('You must be signed in to create a goal.');
      return getConfiguredGoalsService(user).createGoal(user, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useUpdateGoalStatus() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateGoalStatusInput) => {
      if (!user) throw new Error('You must be signed in to update goal status.');
      return getConfiguredGoalsService(user).updateGoalStatus(user, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}

export function useDeleteGoal() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('You must be signed in to delete a goal.');
      return getConfiguredGoalsService(user).deleteGoal(user, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: GOALS_KEY }),
  });
}
