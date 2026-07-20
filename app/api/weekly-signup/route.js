import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { BOOKSTUBE_API_BASE } from '@/lib/api';

const LANGUAGES = new Set(['he', 'en', 'ar', 'de']);
const AGE_RANGES = new Set(['', '3-5', '6-8', '9-12', '13+']);
const clean = (value, max) => (
  typeof value === 'string' ? value.trim().slice(0, max) : ''
);

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'invalid_origin' }, { status: 403 });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Honeypot: return a believable success without creating a CRM contact.
  if (clean(data.website, 200)) return NextResponse.json({ ok: true });

  const email = clean(data.email, 160).toLowerCase();
  const language = LANGUAGES.has(data.language) ? data.language : 'he';
  const ageRange = AGE_RANGES.has(data.ageRange) ? data.ageRange : '';
  const entryBook = clean(data.entryBook, 32).replace(/[^A-Za-z0-9_-]/g, '');
  const entryPath = clean(data.entryPath, 300);
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailLooksValid || data.consent !== true) {
    return NextResponse.json({ error: 'invalid_submission' }, { status: 400 });
  }

  try {
    const clientAddress = String(request.headers.get('x-forwarded-for') || '')
      .split(',')[0].trim();
    const clientKey = createHash('sha256').update(clientAddress || 'unknown').digest('hex').slice(0, 32);
    const response = await fetch(`${BOOKSTUBE_API_BASE}/subscribe`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: new URL(request.url).origin,
        'x-bookstube-client': clientKey,
      },
      body: JSON.stringify({
        email,
        ageRange,
        consent: true,
        source: 'bookstube',
        campaign: 'weekly_reading',
        language,
        entryBook,
        entryPath,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json({ error: result.error || 'signup_failed' }, { status: response.status });
    }
    return NextResponse.json({ ok: true, duplicate: Boolean(result.duplicate) });
  } catch {
    return NextResponse.json({ error: 'signup_failed' }, { status: 502 });
  }
}
