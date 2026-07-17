import { librariesFor, libName, libHref, libSlug } from '@/lib/libraries';

// Server-rendered pills linking to each curated collection (crawlable links).
// Shows only the collections + order set for the current language (LIBRARY_ORDER
// in lib/libraries.js; its first entry is the language's home — that pill links to
// /[lang]). Renders directly above the book grid it switches between. `active` is
// the current collection's slug.
export default function LibrarySwitcher({ lang, active, t }) {
  const libs = librariesFor(lang);
  if (libs.length < 2) return null;
  return (
    <nav className="lib-switch" aria-label="Collections">
      <div className="lib-switch-inner">
        {t ? <span className="lib-switch-label">{t('ui.selectLibrary')}</span> : null}
        {libs.map((lib) => (
          <a
            key={libSlug(lib)}
            href={libHref(lib, lang)}
            className={`lib-pill ${libSlug(lib) === active ? 'lib-pill-active' : ''}`}
          >
            {libName(lib, lang)}
          </a>
        ))}
      </div>
    </nav>
  );
}
