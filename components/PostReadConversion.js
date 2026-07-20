import { bookstubeCreateCta } from '@/lib/cta';
import TrackedCreateLink from './TrackedCreateLink';
import WeeklySignup from './WeeklySignup';

export default function PostReadConversion({ book, lang, t, entryPath, hasRelated }) {
  const analytics = {
    book_id: book.bookId,
    book_title: book.title,
    category: book.topics?.[0] || '',
    language: book.orig_language || lang,
  };
  const weeklyLabels = {
    title: t('conversion.weeklyTitle'),
    text: t('conversion.weeklyText'),
    emailLabel: t('conversion.emailLabel'),
    emailPlaceholder: t('conversion.emailPlaceholder'),
    ageLabel: t('conversion.ageLabel'),
    ageAny: t('conversion.ageAny'),
    age3to5: t('conversion.age3to5'),
    age6to8: t('conversion.age6to8'),
    age9to12: t('conversion.age9to12'),
    age13plus: t('conversion.age13plus'),
    consent: t('conversion.consent'),
    submit: t('conversion.signupButton'),
    submitting: t('conversion.submitting'),
    privacyPrefix: t('conversion.privacyPrefix'),
    privacyLink: t('conversion.privacyLink'),
    successTitle: t('conversion.successTitle'),
    successText: t('conversion.successText'),
    error: t('conversion.error'),
  };
  const privacyLang = lang === 'he' ? 'he' : 'en';

  return (
    <section id="post-reading" className="post-read" aria-labelledby={`post-read-title-${book.bookId}`}>
      <div className="post-read-create">
        <span className="post-read-spark" aria-hidden="true">✨</span>
        <div className="post-read-copy">
          <h2 id={`post-read-title-${book.bookId}`}>{t('conversion.postReadTitle')}</h2>
          <p>{t('conversion.postReadText')}</p>
          <div className="post-read-actions">
            <TrackedCreateLink
              className="btn btn-cta"
              href={bookstubeCreateCta(lang, 'book_end_cta')}
              ctaLocation="book_end_cta"
              analytics={analytics}
            >
              {t('conversion.postReadCreate')}
            </TrackedCreateLink>
            <a className="post-read-continue" href={hasRelated ? '#related-books' : `/${lang}`}>
              {t('conversion.continueReading')} <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>
      <WeeklySignup
        lang={lang}
        book={{
          bookId: book.bookId,
          title: book.title,
          category: book.topics?.[0] || '',
          language: book.orig_language || lang,
        }}
        entryPath={entryPath}
        labels={weeklyLabels}
        privacyHref={`https://www.booksgiant.com/${privacyLang}/privacy`}
      />
    </section>
  );
}
