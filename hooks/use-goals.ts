import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateGoalInput, GoalPeriod, UpdateGoalStatusInput } from '@/types';
import { useAuthContext } from '@/context/AuthContext';
import { getConfiguredGoalsService } from '@/lib/goals';

export const GOALS_KEY = ['goals'] as const;

export function useGoals(period?: GoalPeriod) {
  const { user, provider } = useAuthContext();
  return useQuery({
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
    enabled: Boolean(user),
  });
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
