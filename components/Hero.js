import { bookstubeCreateCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';

const HERO_VIDEO_URL = 'https://s3.eu-west-1.amazonaws.com/school.booksgiant.com/video/books-tube-hero.mp4';

// Full-bleed dark masthead. The visual is the "books flying through a cosmic
// tube" clip — poster = the matching still frame (books-tube-hero.jpg), whose
// palette (deep space navy/blue-violet/magenta) also drives the band's gradient,
// so the video sits in the section instead of on it.
export default function Hero({ t, lang }) {
  return (
    <section className="hero-band">
      <div className="hero">
        <div className="hero-text">
          <h1>{t('bookstubeHome.heroTitle')}</h1>
          <p>{t('bookstubeHome.heroSubtitle')}</p>
          <p className="hero-trust">{t('bookstubeHome.heroTrust')}</p>
          <div className="hero-cta">
            <a className="btn btn-hero-primary" href="#library">
              {t('bookstubeHome.heroPrimaryCta')}
            </a>
            <TrackedCreateLink
              className="btn btn-cta"
              href={bookstubeCreateCta(lang, 'homepage_hero')}
              ctaLocation="homepage_hero"
            >
              {t('bookstubeHome.heroWriteCta')}
            </TrackedCreateLink>
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
      </div>
    </section>
  );
}
