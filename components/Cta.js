import { tubeCreateAnonymCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';

// Gentle conversion section — kept visually secondary (free library first).
// The creator used to be embedded here as an <iframe>, but it auto-focuses an input
// on load, and browsers scroll cross-origin frames into view when that happens —
// yanking readers away from whatever they were looking at. The CTA now opens the
// dedicated creator directly, while /[lang]/create remains available as a noindex
// embed route for old links.
export default function Cta({ t, lang }) {
  return (
    <section className="convert">
      <h2>{t('bookstubeHome.ctaTitle')}</h2>
      <p>{t('bookstubeHome.ctaText')}</p>
      <div className="convert-cta-row">
        <TrackedCreateLink
          className="btn btn-cta"
          href={tubeCreateAnonymCta(lang, 'library_end_create')}
          ctaLocation="library_end_create"
          target="_blank"
          rel="noopener"
        >
          {t('bookstubeHome.ctaButton')}
        </TrackedCreateLink>
      </div>
    </section>
  );
}
