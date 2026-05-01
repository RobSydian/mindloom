import i18n from '@/lib/i18n';
import { resources } from '@/lib/i18n/resources';

export type TranslationKey = keyof typeof resources.en.translation;

export function t(key: TranslationKey, vars?: Record<string, string | number>): string {
  return i18n.t(key, vars);
}
