import type {
  AppUser,
  CreateGoalInput,
  Goal,
  GoalPeriod,
  UpdateGoalStatusInput,
} from '@/types';

export interface GoalsService {
  getGoals(user: AppUser, period?: GoalPeriod): Promise<Goal[]>;
  createGoal(user: AppUser, data: CreateGoalInput): Promise<Goal>;
  updateGoalStatus(user: AppUser, input: UpdateGoalStatusInput): Promise<Goal>;
  deleteGoal(user: AppUser, id: string): Promise<void>;
}
