import { tubeCta } from '@/lib/cta';

// Gentle conversion section — kept visually secondary (free library first).
// The creator used to be embedded here as an <iframe>, but it auto-focuses an input
// on load, and browsers scroll cross-origin frames into view when that happens —
// yanking readers away from whatever they were looking at. Sending people to a
// dedicated /create page instead keeps that jump contained to a page whose whole
// purpose is the embed.
export default function Cta({ t, lang }) {
  return (
    <section className="convert">
      <h2>{t('bookstubeHome.ctaTitle')}</h2>
      <p>{t('bookstubeHome.ctaText')}</p>
      <div className="convert-cta-row">
        <a
          className="btn btn-cta"
          href={tubeCta('bookstube_footer')}
          target="_blank"
          rel="noopener"
        >
          {t('bookstubeHome.ctaButton')}
        </a>
        <a className="btn btn-outline" href={`/${lang}/create`}>
          {t('bookstubeHome.ctaTryHere')}
        </a>
      </div>
    </section>
  );
}
