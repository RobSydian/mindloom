import type {
  Goal,
  GoalPeriod,
  GoalStatus,
  CreateGoalInput,
  UpdateGoalStatusInput,
} from '@/types';
import { SEED_GOALS } from './seed';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let store: Goal[] = [...SEED_GOALS];

export async function getGoals(period?: GoalPeriod): Promise<Goal[]> {
  await delay();
  const result = period ? store.filter((g) => g.period === period) : [...store];
  return result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createGoal(data: CreateGoalInput): Promise<Goal> {
  await delay();
  const now = new Date().toISOString();
  const goal: Goal = {
    ...data,
    id: `goal_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store = [goal, ...store];
  return goal;
}

export async function updateGoalStatus(
  input: UpdateGoalStatusInput
): Promise<Goal> {
  await delay(350);
  const idx = store.findIndex((g) => g.id === input.id);
  if (idx === -1) throw new Error('Goal not found.');

  const requiresReason: GoalStatus[] = ['blocked', 'cancelled'];
  if (requiresReason.includes(input.status) && !input.reason) {
    throw new Error('A reason is required for this status.');
  }

  const updated: Goal = {
    ...store[idx],
    status: input.status,
    statusReason: input.reason ?? null,
    updatedAt: new Date().toISOString(),
  };
  store = store.map((g) => (g.id === input.id ? updated : g));
  return updated;
}

export async function deleteGoal(id: string): Promise<void> {
  await delay(300);
  store = store.filter((g) => g.id !== id);
}
