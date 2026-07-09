import { LOCALES } from '@/lib/i18n';

// "Filter by language" pills — real ?bookLang= links, crawlable, server-rendered,
// no client JS. Uses the read API's bookLang param, which filters by book.orig_language.
export default function LangFilter({ t, active, basePath, topic }) {
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
      {LOCALES.map((code) => (
        <a key={code} href={href(code)} className={`chip ${active === code ? 'chip-active' : ''}`}>
          {t(`bookstubeHome.lang_${code}`)}
        </a>
      ))}
    </nav>
  );
}
