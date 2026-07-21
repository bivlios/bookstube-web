import he from './locales/he.json';
import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';

export const LOCALES = ['he', 'en', 'ar', 'de'];
export const DEFAULT_LOCALE = 'he';

// Book languages are not limited to the site's four interface locales. Keep the
// query value constrained to a language-code shape while allowing languages
// reported dynamically by the library API (for example Hindi, `hi`).
export const isBookLanguage = (lang) =>
  typeof lang === 'string' && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(lang);

const DICTS = { he, en, ar, de };

export const isRTL = (lang) => lang === 'he' || lang === 'ar';
export const dir = (lang) => (isRTL(lang) ? 'rtl' : 'ltr');

// Short uppercase language badge (EN / HE / AR / DE) shown on book cards.
export const langBadge = (lang) => (lang ? String(lang).slice(0, 2).toUpperCase() : '');

const dictFor = (lang) => DICTS[LOCALES.includes(lang) ? lang : DEFAULT_LOCALE];

// makeT('he')('bookstubeHome.heroTitle') → translated string (falls back to the key).
export function makeT(lang) {
  const d = dictFor(lang);
  return (key) =>
    key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : null), d) ?? key;
}
