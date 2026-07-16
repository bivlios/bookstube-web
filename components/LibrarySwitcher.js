import { librariesFor, libName, libHref } from '@/lib/libraries';

// Server-rendered pills linking to each curated collection (crawlable links).
// Shows only the collections + order set for the current language (LIBRARY_ORDER
// in lib/libraries.js). Renders directly above the book grid it switches between.
export default function LibrarySwitcher({ lang, activeId, t }) {
  const libs = librariesFor(lang);
  if (libs.length < 2) return null;
  return (
    <nav className="lib-switch" aria-label="Collections">
      <div className="lib-switch-inner">
        {t ? <span className="lib-switch-label">{t('ui.selectLibrary')}</span> : null}
        {libs.map((lib) => (
          <a
            key={lib.id}
            href={libHref(lib, lang)}
            className={`lib-pill ${lib.id === activeId ? 'lib-pill-active' : ''}`}
          >
            {libName(lib, lang)}
          </a>
        ))}
      </div>
    </nav>
  );
}
