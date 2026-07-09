// Warm, child-friendly hero. The visual is a lightweight collage built from real
// book covers (no images shipped, no animation libraries) — a graceful placeholder
// until a final illustration exists.
export default function Hero({ t, covers = [] }) {
  const tiles = covers.filter(Boolean).slice(0, 5);
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>{t('bookstubeHome.heroTitle')}</h1>
        <p>{t('bookstubeHome.heroSubtitle')}</p>
        <p className="hero-trust">{t('bookstubeHome.heroTrust')}</p>
        <div className="hero-cta">
          <a className="btn btn-primary" href="#library">
            {t('bookstubeHome.heroPrimaryCta')}
          </a>
          <a className="btn btn-outline" href="#topics">
            {t('bookstubeHome.heroSecondaryCta')}
          </a>
        </div>
      </div>

        <img src="/images/bookstube-hero.png" alt="hero" loading="lazy" />

        {/*tiles.length ? (
        <div className="hero-visual_" aria-hidden="true">
          {tiles.map((c, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={c} alt="" className={`hero-cover hero-cover-${i}`} loading="lazy" />
          ))}
        </div>
      ) : null*/}
    </section>
  );
}
