import { bookstubeCreateCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';

// Gentle conversion section — kept visually secondary (free library first).
// The creator used to be embedded here as an <iframe>, but it auto-focuses an input
// on load, and browsers scroll cross-origin frames into view when that happens —
// yanking readers away from whatever they were looking at. The CTA now opens the
// dedicated noindex /[lang]/create page, where the iframe is the page's main purpose.
export default function Cta({ t, lang }) {
  return (
    <section className="convert">
      <h2>{t('bookstubeHome.ctaTitle')}</h2>
      <p>{t('bookstubeHome.ctaText')}</p>
      <div className="convert-cta-row">
        <TrackedCreateLink
          className="btn btn-cta"
          href={bookstubeCreateCta(lang, 'library_end_create')}
          ctaLocation="library_end_create"
        >
          {t('bookstubeHome.ctaButton')}
        </TrackedCreateLink>
      </div>
    </section>
  );
}
