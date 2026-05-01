import type { ImpressionsService } from './impressions-service';
import { getImpressions, createImpression, deleteImpression } from '@/lib/mock/impressions';

export const mockImpressionsService: ImpressionsService = {
  async getImpressions() {
    return getImpressions();
  },
  async createImpression(_user, data) {
    return createImpression(data);
  },
  async deleteImpression(_user, id) {
    await deleteImpression(id);
  },
};
