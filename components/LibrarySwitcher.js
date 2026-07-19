import { librariesFor, libName, libHref, libSlug } from '@/lib/libraries';
import { LOCALES } from '@/lib/i18n';

// Server-rendered pills linking to each curated collection (crawlable links).
// Shows only the collections + order set for the current language (LIBRARY_ORDER
// in lib/libraries.js; its first entry is the language's home — that pill links to
// /[lang]). Renders directly above the book grid it switches between. `active` is
// the current collection's slug.
//
// When `basePath` is given, a second pill group filters the grid by BOOK language —
// plain ?bookLang= GET links (crawlable, no client JS) using the read API's
// orig_language filter, living on the bar right next to the collections it filters.
// `availableLangs` (whole-library facet from the API) hides languages with no books.
// Merge it with the current page's books so a stale/incomplete cached facet cannot
// hide a language that is visibly present. When neither signal is available (older
// API), all locales remain available. `bookLang` is the active filter and `topic`
// is preserved in the links.
export default function LibrarySwitcher({
  lang, active, t, basePath, bookLang, topic, availableLangs, books,
}) {
  const libs = librariesFor(lang);
  const facetLangs = Array.isArray(availableLangs) ? availableLangs : [];
  const pageLangs = Array.isArray(books) ? books.map((book) => book.orig_language) : [];
  const knownLangs = new Set([...facetLangs, ...pageLangs]);
  const langs = knownLangs.size
    ? LOCALES.filter((code) => knownLangs.has(code))
    : LOCALES;
  const showLangs = !!basePath && !!t && langs.length >= 2;
  if (libs.length < 2 && !showLangs) return null;

  const langHref = (code) => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (code) p.set('bookLang', code);
    const q = p.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  return (
    <nav className="lib-switch" aria-label="Collections">
      <div className="lib-switch-inner">
        {t ? <span className="lib-switch-label">{t('ui.selectLibrary')}</span> : null}
        {libs.length > 1 ? libs.map((lib) => (
          <a
            key={libSlug(lib)}
            href={libHref(lib, lang)}
            className={`lib-pill ${libSlug(lib) === active ? 'lib-pill-active' : ''}`}
          >
            {libName(lib, lang)}
          </a>
        )) : null}
        {showLangs ? (
          <div className="lib-switch-langs" role="group" aria-label={t('bookstubeHome.filterLanguage')}>
            <a href={langHref()} className={`lang-pill ${!bookLang ? 'lang-pill-active' : ''}`}>
              {t('bookstubeHome.allLanguages')}
            </a>
            {langs.map((code) => (
              <a
                key={code}
                href={langHref(code)}
                className={`lang-pill ${bookLang === code ? 'lang-pill-active' : ''}`}
              >
                {t(`bookstubeHome.lang_${code}`)}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
