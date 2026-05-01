import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import { resources, type SupportedLanguage } from './resources';

function normalizeLanguageTag(tag: string | null | undefined): SupportedLanguage {
  if (!tag) return 'en';
  const base = tag.toLowerCase().split('-')[0];
  if (base === 'es') return 'es';
  if (base === 'ca') return 'ca';
  return 'en';
}

function getInitialLanguage(): SupportedLanguage {
  const locales = getLocales();
  const preferred = locales[0]?.languageTag;
  return normalizeLanguageTag(preferred);
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
    returnNull: false,
  });
}

export async function setAppLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang);
}

export function getAppLanguage(): SupportedLanguage {
  return normalizeLanguageTag(i18n.language);
}

export default i18n;
