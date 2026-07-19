import { LOCALES, dir, makeT } from '@/lib/i18n';

const FEEDBACK_TYPES = [
  ['idea', 'feedbackPage.categoryIdea', '💡'],
  ['book', 'feedbackPage.categoryBook', '📚'],
  ['feedback', 'feedbackPage.categoryFeedback', '💬'],
  ['problem', 'feedbackPage.categoryProblem', '🛠️'],
  ['other', 'feedbackPage.categoryOther', '✨'],
];

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const t = makeT(params.lang);
  return {
    title: t('feedbackPage.metaTitle'),
    description: t('feedbackPage.metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default function FeedbackPage({ params, searchParams }) {
  const lang = LOCALES.includes(params.lang) ? params.lang : 'he';
  const t = makeT(lang);
  const sent = searchParams?.sent === '1';
  const failed = searchParams?.error === '1';
  const selectedType = FEEDBACK_TYPES.some(([value]) => value === searchParams?.type)
    ? searchParams.type
    : 'idea';

  return (
    <main className="feedback-page" dir={dir(lang)}>
      <section className="feedback-shell">
        <header className="feedback-intro">
          <span className="feedback-eyebrow">{t('feedbackPage.eyebrow')}</span>
          <h1>{t('feedbackPage.title')}</h1>
          <p>{t('feedbackPage.intro')}</p>
        </header>

        {sent ? (
          <div className="feedback-card feedback-status" role="status">
            <span className="feedback-status-icon" aria-hidden="true">✓</span>
            <h2>{t('feedbackPage.successTitle')}</h2>
            <p>{t('feedbackPage.successText')}</p>
            <div className="feedback-status-actions">
              <a className="btn btn-primary" href={`/${lang}/feedback`}>
                {t('feedbackPage.sendAnother')}
              </a>
              <a className="btn btn-outline" href={`/${lang}`}>
                {t('feedbackPage.backToLibrary')}
              </a>
            </div>
          </div>
        ) : (
          <div className="feedback-card">
            {failed ? (
              <div className="feedback-error" role="alert">
                <strong>{t('feedbackPage.errorTitle')}</strong>
                <span>
                  {t('feedbackPage.errorText')}{' '}
                  <a href="mailto:support@bivlios.com">support@bivlios.com</a>.
                </span>
              </div>
            ) : null}

            <form className="feedback-form" action="/api/feedback" method="post">
              <input type="hidden" name="lang" value={lang} />
              <div className="feedback-honeypot" aria-hidden="true">
                <label htmlFor="feedback-website">Website</label>
                <input id="feedback-website" name="website" type="text" tabIndex="-1" autoComplete="off" />
              </div>

              <fieldset className="feedback-categories">
                <legend>{t('feedbackPage.categoryLegend')}</legend>
                <div className="feedback-choice-grid">
                  {FEEDBACK_TYPES.map(([value, labelKey, icon]) => (
                    <label className="feedback-choice" key={value}>
                      <input
                        className="feedback-choice-input"
                        type="radio"
                        name="category"
                        value={value}
                        required
                        defaultChecked={value === selectedType}
                      />
                      <span className="feedback-choice-label">
                        <span aria-hidden="true">{icon}</span>
                        {t(labelKey)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="feedback-field-grid">
                <label className="feedback-field" htmlFor="feedback-name">
                  <span>{t('feedbackPage.nameLabel')}</span>
                  <input
                    id="feedback-name"
                    name="name"
                    type="text"
                    maxLength="80"
                    autoComplete="name"
                    placeholder={t('feedbackPage.namePlaceholder')}
                    required
                  />
                </label>
                <label className="feedback-field" htmlFor="feedback-email">
                  <span>{t('feedbackPage.emailLabel')}</span>
                  <input
                    id="feedback-email"
                    name="email"
                    type="email"
                    maxLength="160"
                    autoComplete="email"
                    placeholder={t('feedbackPage.emailPlaceholder')}
                    required
                  />
                </label>
              </div>

              <label className="feedback-field" htmlFor="feedback-message">
                <span>{t('feedbackPage.messageLabel')}</span>
                <textarea
                  id="feedback-message"
                  name="message"
                  rows="7"
                  minLength="10"
                  maxLength="2000"
                  placeholder={t('feedbackPage.messagePlaceholder')}
                  required
                />
              </label>

              <div className="feedback-submit-row">
                <p>{t('feedbackPage.privacy')}</p>
                <button className="btn btn-cta" type="submit">
                  {t('feedbackPage.submit')}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
