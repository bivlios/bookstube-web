const HERO_VIDEO_URL = 'https://s3.eu-west-1.amazonaws.com/school.booksgiant.com/video/books-tube-hero.mp4';

// Warm, child-friendly hero. The visual is the "books flying through a cosmic
// tube" clip — poster = the matching still frame (books-tube-hero.jpg), which also
// samples the palette for the glow behind it (deep space navy/purple/magenta),
// tying the section's accent colors to the video instead of clashing with it.
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

      <div className="hero-visual-wrap">
        <div className="hero-glow" aria-hidden="true" />
        {/* autoPlay+muted+playsInline: the combination browsers require for
            autoplay without a user gesture, including mobile Safari/Chrome. */}
        <video
          className="hero-illustration"
          poster="/images/books-tube-hero.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
          {/* Fallback for browsers without <video> support — never shown otherwise. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/books-tube-hero.jpg" alt="" className="hero-illustration" />
        </video>
      </div>

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
