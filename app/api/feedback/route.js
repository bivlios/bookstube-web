import { NextResponse } from 'next/server';

const CONTACT_ENDPOINT = 'https://booksgiant.com/api/contact';
const VALID_LANGUAGES = new Set(['he', 'en', 'ar', 'de']);
const CATEGORY_NAMES = {
  idea: 'Idea for BooksTube',
  book: 'Book or topic request',
  feedback: 'General feedback',
  problem: 'Problem report',
  other: 'Other',
};

const clean = (value, maxLength) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

const feedbackRedirect = (request, lang, state) => {
  const url = new URL(`/${lang}/feedback`, request.url);
  url.searchParams.set(state, '1');
  return NextResponse.redirect(url, 303);
};

export async function POST(request) {
  let data;
  try {
    data = await request.formData();
  } catch {
    return feedbackRedirect(request, 'he', 'error');
  }

  const requestedLang = clean(data.get('lang'), 2);
  const lang = VALID_LANGUAGES.has(requestedLang) ? requestedLang : 'he';

  // Bots commonly fill fields hidden from people. Pretend the submission worked,
  // but do not forward it to the contact inbox.
  if (clean(data.get('website'), 200)) {
    return feedbackRedirect(request, lang, 'sent');
  }

  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return feedbackRedirect(request, lang, 'error');
  }

  const category = clean(data.get('category'), 20);
  const name = clean(data.get('name'), 80);
  const email = clean(data.get('email'), 160);
  const message = clean(data.get('message'), 2000);
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!CATEGORY_NAMES[category] || !name || !emailLooksValid || message.length < 10) {
    return feedbackRedirect(request, lang, 'error');
  }

  const forwardedMessage = [
    'BooksTube website feedback',
    `Category: ${CATEGORY_NAMES[category]}`,
    `Site language: ${lang}`,
    '',
    message,
  ].join('\n');

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: '',
        message: forwardedMessage,
        // Keep the value accepted by the existing Books Giant contact service;
        // the message prefix above identifies this as BooksTube feedback.
        source: 'contact-page',
      }),
      cache: 'no-store',
    });

    if (!response.ok) return feedbackRedirect(request, lang, 'error');
  } catch {
    return feedbackRedirect(request, lang, 'error');
  }

  return feedbackRedirect(request, lang, 'sent');
}
