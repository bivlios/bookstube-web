import { tubeCta, tubeCreateAnonymCta } from '@/lib/cta';

// Gentle conversion section — kept visually secondary (free library first).
export default function Cta({ t, lang }) {
  return (
    <section className="convert">
      <h2>{t('bookstubeHome.ctaTitle')}</h2>
      <p>{t('bookstubeHome.ctaText')}</p>
      <a
        className="btn btn-cta"
        href={tubeCta('bookstube_footer')}
        target="_blank"
        rel="noopener"
      >
        {t('bookstubeHome.ctaButton')}
      </a>
<br/><br/>

        <iframe
          className="cta-iframe"
          width="1200"
          height="800"
          src={tubeCreateAnonymCta(lang, 'bookstube_footer_iframe')}
          title={t('bookstubeHome.ctaTitle')}
          loading="lazy"
        />
        {/*<img src="/images/creator.jpg" alt="creator" className="books-tube-logo" />*/}
    </section>
  );
}
