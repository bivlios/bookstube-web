import LangSwitcher from './LangSwitcher';
import HeaderSearch from './HeaderSearch';
import { tubeCta } from '@/lib/cta';

export default function Header({ lang, t }) {
  return (
    <header className="site-header">
      <a href={`/${lang}`} className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-sml.png" alt={t('ui.booksgiant')} className="brand-logo" />
          {/*<span className="brand-name">{t('ui.booksgiant')}</span>*/}
      </a>
      <HeaderSearch lang={lang} placeholder={t('tagLibrary.searchPlaceholder')} />
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
