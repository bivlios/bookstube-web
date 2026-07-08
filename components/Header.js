import LangSwitcher from './LangSwitcher';
import { tubeCta } from '@/lib/cta';

export default function Header({ lang, t }) {
  return (
    <header className="site-header">
      <a href={`/${lang}`} className="brand">
        <span className="brand-mark">📚</span>
        <span className="brand-name">{t('ui.booksgiant')}</span>
      </a>
      <div className="header-actions">
        <LangSwitcher lang={lang} />
        <a
          className="btn btn-header"
          href={tubeCta('taglib_topbar')}
          target="_blank"
          rel="noopener"
        >
          {t('tagLibrary.cta')}
        </a>
      </div>
    </header>
  );
}
