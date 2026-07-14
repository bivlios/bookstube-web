import { LOCALES } from '@/lib/i18n';

// "Filter by language" pills — real ?bookLang= links, crawlable, server-rendered,
// no client JS. Uses the read API's bookLang param, which filters by book.orig_language.
// `availableLangs` (whole-library facet from the API) hides languages with no books;
// when absent (older API) all locales show. With only one real language there is
// nothing to filter, so the row disappears entirely.
export default function LangFilter({ t, active, basePath, topic, availableLangs }) {
  const langs = Array.isArray(availableLangs)
    ? LOCALES.filter((code) => availableLangs.includes(code))
    : LOCALES;
  if (langs.length < 2) return null;

  const href = (code) => {
    const p = new URLSearchParams();
    if (topic) p.set('topic', topic);
    if (code) p.set('bookLang', code);
    const q = p.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  return (
    <nav className="lang-filter" aria-label={t('bookstubeHome.filterLanguage')}>
      <a href={href()} className={`chip ${!active ? 'chip-active' : ''}`}>
        {t('bookstubeHome.allLanguages')}
      </a>
      {langs.map((code) => (
        <a key={code} href={href(code)} className={`chip ${active === code ? 'chip-active' : ''}`}>
          {t(`bookstubeHome.lang_${code}`)}
        </a>
      ))}
    </nav>
  );
}
