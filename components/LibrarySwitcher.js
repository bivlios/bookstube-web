import { LIBRARIES, libName, libHref } from '@/lib/libraries';

// Server-rendered pills linking to each curated collection (crawlable links).
// Default: sticky dark bar under the header (collection/search pages). With
// variant="hero" it renders as a transparent row for slotting inside the
// hero masthead instead (home page).
export default function LibrarySwitcher({ lang, activeId, t, variant }) {
  if (LIBRARIES.length < 2) return null;
  const cls = variant === 'hero' ? 'lib-switch lib-switch-hero' : 'lib-switch';
  return (
    <nav className={cls} aria-label="Collections">
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
