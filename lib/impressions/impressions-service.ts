import type { AppUser, CreateImpressionInput, Impression } from '@/types';

export interface ImpressionsService {
  getImpressions(user: AppUser): Promise<Impression[]>;
  createImpression(user: AppUser, data: CreateImpressionInput): Promise<Impression>;
  deleteImpression(user: AppUser, id: string): Promise<void>;
}
