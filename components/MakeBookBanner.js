import { tubeCreateAnonymCta } from '@/lib/cta';

// Eye-catching banner ad (recreated from the banner-make-book.jpg design) with
// live translated copy so it reads correctly in RTL locales too.
export default function MakeBookBanner({ lang, t }) {
  return (
    <a
      className="make-book-banner"
      href={tubeCreateAnonymCta(lang, 'library_banner')}
      target="_blank"
      rel="noopener"
    >
      <img src="/images/banner-mom.png" alt="" className="make-book-banner-img" />
      <span className="make-book-banner-text">
        <strong>{t('bookstubeHome.ctaTitle')}</strong>
        <span>{t('bookstubeHome.ctaText')}</span>
      </span>
      <span className="btn btn-cta make-book-banner-btn">{t('bookstubeHome.ctaButton')}</span>
    </a>
  );
}
