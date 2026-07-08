import he from './locales/he.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';

export const LOCALES = ['he', 'en', 'ar', 'de'];
export const DEFAULT_LOCALE = 'he';

const DICTS = { he, en, ar, de };

export const isRTL = (lang) => lang === 'he' || lang === 'ar';
export const dir = (lang) => (isRTL(lang) ? 'rtl' : 'ltr');

const dictFor = (lang) => DICTS[LOCALES.includes(lang) ? lang : DEFAULT_LOCALE];

// makeT('he')('bookstubeHome.heroTitle') → translated string (falls back to the key).
export function makeT(lang) {
  const d = dictFor(lang);
  return (key) =>
    key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), d) ?? key;
}
