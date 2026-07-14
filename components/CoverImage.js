'use client';

import { useMemo, useState } from 'react';

// <img> with graceful degradation for missing covers: walks a fallback chain and,
// when every real image fails, swaps in a generated SVG cover — title + author on
// a gradient picked deterministically from the bookId, so a coverless book looks
// designed rather than broken (and always the same color). Regenerating the real
// cover later needs no code change; the placeholder simply stops appearing.

const PALETTES = [
  ['#667eea', '#764ba2'],
  ['#f97316', '#c2410c'],
  ['#0ea5e9', '#2563eb'],
  ['#10b981', '#047857'],
  ['#f43f5e', '#be123c'],
  ['#8b5cf6', '#6d28d9'],
];

const hash = (s) => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Greedy word-wrap into at most `maxLines` lines of ~`perLine` chars, ellipsis overflow.
const wrap = (text, perLine, maxLines) => {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= perLine) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, perLine - 1) + '…';
  }
  return lines.length ? lines : ['📖'];
};

const makePlaceholder = (title, author, seed) => {
  const [c1, c2] = PALETTES[Math.abs(hash(seed || title || 'book')) % PALETTES.length];
  const lines = wrap(title || '', 14, 4);
  const startY = 190 - (lines.length - 1) * 22;
  const titleText = lines
    .map((l, i) => `<text x="150" y="${startY + i * 44}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">${esc(l)}</text>`)
    .join('');
  const authorText = author
    ? `<text x="150" y="360" font-size="18" fill="rgba(255,255,255,0.85)" text-anchor="middle">${esc(author)}</text>`
    : '';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>` +
    `<rect width="300" height="400" fill="url(#g)"/>` +
    `<rect x="14" y="14" width="272" height="372" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" rx="10"/>` +
    `<text x="150" y="90" font-size="34" text-anchor="middle">📖</text>` +
    titleText + authorText +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export default function CoverImage({ src, fallbacks = [], title, author, seed, className, loading }) {
  const chain = useMemo(() => [src, ...fallbacks].filter(Boolean), [src, fallbacks]);
  const [idx, setIdx] = useState(0);
  const placeholder = useMemo(() => makePlaceholder(title, author, seed), [title, author, seed]);
  const failedAll = idx >= chain.length;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failedAll ? placeholder : chain[idx]}
      alt={title || ''}
      className={className}
      loading={loading}
      onError={failedAll ? undefined : () => setIdx((i) => i + 1)}
    />
  );
}
