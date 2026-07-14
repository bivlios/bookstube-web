import { LIBRARIES, libName, libHref } from '@/lib/libraries';

// Server-rendered pills linking to each curated collection (crawlable links).
export default function LibrarySwitcher({ lang, activeId, t }) {
  if (LIBRARIES.length < 2) return null;
  return (
    <nav className="lib-switch" aria-label="Collections">
      <div className="lib-switch-inner">
        {t ? <span className="lib-switch-label">{t('ui.selectLibrary')}</span> : null}
        {LIBRARIES.map((lib) => (
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
