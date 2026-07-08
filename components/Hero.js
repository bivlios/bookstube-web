import { tubeCta } from '@/lib/cta';

export default function Hero({ t }) {
  return (
    <section className="hero">
      <h1>{t('bookstubeHome.heroTitle')}</h1>
      <p>{t('bookstubeHome.heroSubtitle')}</p>
      <div className="hero-cta">
        <a className="btn btn-primary" href="#library">
          {t('bookstubeHome.heroPrimaryCta')}
        </a>
        <a
          className="btn btn-outline"
          href={tubeCta('bookstube_hero')}
          target="_blank"
          rel="noopener"
        >
          {t('bookstubeHome.heroSecondaryCta')}
        </a>
      </div>
    </section>
  );
}
