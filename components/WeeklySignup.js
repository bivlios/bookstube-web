'use client';

import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function WeeklySignup({ lang, book, entryPath, labels, privacyHref }) {
  const rootRef = useRef(null);
  const viewTrackedRef = useRef(false);
  const [state, setState] = useState('idle');
  const analytics = {
    book_id: book.bookId,
    book_title: book.title,
    category: book.category,
    language: book.language,
    cta_location: 'post_read_signup',
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const show = () => {
      if (viewTrackedRef.current) return;
      viewTrackedRef.current = true;
      trackEvent('bookstube_email_signup_view', analytics);
    };
    if (typeof IntersectionObserver === 'undefined') { show(); return undefined; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        show();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    observer.observe(root);
    return () => observer.disconnect();
  }, [book.bookId]);

  const submit = async (event) => {
    event.preventDefault();
    if (state === 'submitting') return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setState('submitting');
    trackEvent('bookstube_email_signup_submit', analytics);

    try {
      const response = await fetch('/api/weekly-signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          ageRange: data.get('ageRange'),
          consent: data.get('consent') === 'yes',
          website: data.get('website'),
          language: lang,
          entryBook: book.bookId,
          entryPath,
        }),
      });
      if (!response.ok) throw new Error('signup failed');
      setState('success');
      trackEvent('bookstube_email_signup_success', analytics);
    } catch {
      setState('error');
    }
  };

  return (
    <div className="weekly-signup" ref={rootRef}>
      {state === 'success' ? (
        <div className="weekly-success" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <h3>{labels.successTitle}</h3>
            <p>{labels.successText}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="weekly-heading">
            <span className="weekly-icon" aria-hidden="true">📖</span>
            <div>
              <h3>{labels.title}</h3>
              <p>{labels.text}</p>
            </div>
          </div>
          <form className="weekly-form" onSubmit={submit}>
            <div className="feedback-honeypot" aria-hidden="true">
              <label htmlFor={`weekly-website-${book.bookId}`}>Website</label>
              <input id={`weekly-website-${book.bookId}`} name="website" type="text" tabIndex="-1" autoComplete="off" />
            </div>
            <label className="weekly-field" htmlFor={`weekly-email-${book.bookId}`}>
              <span>{labels.emailLabel}</span>
              <input
                id={`weekly-email-${book.bookId}`}
                name="email"
                type="email"
                maxLength="160"
                autoComplete="email"
                placeholder={labels.emailPlaceholder}
                required
              />
            </label>
            <label className="weekly-field" htmlFor={`weekly-age-${book.bookId}`}>
              <span>{labels.ageLabel}</span>
              <select id={`weekly-age-${book.bookId}`} name="ageRange" defaultValue="">
                <option value="">{labels.ageAny}</option>
                <option value="3-5">{labels.age3to5}</option>
                <option value="6-8">{labels.age6to8}</option>
                <option value="9-12">{labels.age9to12}</option>
                <option value="13+">{labels.age13plus}</option>
              </select>
            </label>
            <button className="btn btn-cta weekly-submit" type="submit" disabled={state === 'submitting'}>
              {state === 'submitting' ? labels.submitting : labels.submit}
            </button>
            <label className="weekly-consent">
              <input name="consent" type="checkbox" value="yes" required />
              <span>{labels.consent}</span>
            </label>
            <p className="weekly-privacy">
              {labels.privacyPrefix}{' '}
              <a href={privacyHref} target="_blank" rel="noopener">{labels.privacyLink}</a>.
            </p>
            {state === 'error' ? <p className="weekly-error" role="alert">{labels.error}</p> : null}
          </form>
        </>
      )}
    </div>
  );
}
