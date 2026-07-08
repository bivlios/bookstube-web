import { LIBRARIES, libName, libHref } from '@/lib/libraries';

// Server-rendered pills linking to each curated collection (crawlable links).
export default function LibrarySwitcher({ lang, activeId }) {
  if (LIBRARIES.length < 2) return null;
  return (
    <nav className="lib-switch" aria-label="Collections">
      <div className="lib-switch-inner">
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
