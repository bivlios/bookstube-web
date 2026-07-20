import LangSwitcher from './LangSwitcher';
import HeaderSearch from './HeaderSearch';
import { bookstubeCreateCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';

export default function Header({ lang, t }) {
  return (
    <header className="site-header">
      <a href={`/${lang}`} className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-sml.png" alt={t('ui.booksgiant')} className="brand-logo" />
        <span className="brand-tagline">{t('ui.tagline')}</span>
      </a>
      <HeaderSearch
        lang={lang}
        placeholder={t('tagLibrary.searchPlaceholder')}
        closeLabel={t('bookPage.backToLibrary')}
      />
      <div className="header-actions">
        <LangSwitcher lang={lang} />
        <TrackedCreateLink
          className="btn btn-header"
          href={bookstubeCreateCta(lang, 'header_create')}
          ctaLocation="header_create"
        >
          {t('tagLibrary.cta')}
        </TrackedCreateLink>
      </div>
    </header>
  );
}
