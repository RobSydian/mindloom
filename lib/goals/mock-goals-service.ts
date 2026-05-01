import type { GoalsService } from './goals-service';
import { createGoal, deleteGoal, getGoals, updateGoalStatus } from '@/lib/mock/goals';

export const mockGoalsService: GoalsService = {
  async getGoals(_user, period) {
    return getGoals(period);
  },
  async createGoal(_user, data) {
    return createGoal(data);
  },
  async updateGoalStatus(_user, input) {
    return updateGoalStatus(input);
  },
  async deleteGoal(_user, id) {
    return deleteGoal(id);
  },
};
