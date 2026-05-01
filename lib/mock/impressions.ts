import type { Impression, CreateImpressionInput } from '@/types';
import { SEED_IMPRESSIONS } from './seed';

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

let store: Impression[] = [...SEED_IMPRESSIONS];

export async function getImpressions(): Promise<Impression[]> {
  await delay();
  return [...store].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createImpression(
  data: CreateImpressionInput
): Promise<Impression> {
  await delay();
  const now = new Date().toISOString();
  const impression: Impression = {
    ...data,
    id: `imp_${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  store = [impression, ...store];
  return impression;
}

export async function deleteImpression(id: string): Promise<void> {
  await delay(300);
  store = store.filter((i) => i.id !== id);
}
