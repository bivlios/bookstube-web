import { bookstubeCreateCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';

// Eye-catching banner ad (recreated from the banner-make-book.jpg design) with
// live translated copy so it reads correctly in RTL locales too.
export default function MakeBookBanner({ lang, t }) {
  return (
    <TrackedCreateLink
      className="make-book-banner"
      href={bookstubeCreateCta(lang, 'homepage_banner')}
      ctaLocation="homepage_banner"
    >
      <img src="/images/banner-mom.png" alt="" className="make-book-banner-img" />
      <span className="make-book-banner-text">
        <strong>{t('bookstubeHome.ctaTitle')}</strong>
        <span>{t('bookstubeHome.ctaText')}</span>
      </span>
      <span className="btn btn-cta make-book-banner-btn">{t('bookstubeHome.ctaButton')}</span>
    </TrackedCreateLink>
  );
}
