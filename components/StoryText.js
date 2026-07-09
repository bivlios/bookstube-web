'use client';
import { useState } from 'react';

// Full story text stays in the HTML (crawlable for SEO) but is visually clamped to a
// short preview (~4 lines) with a fade, expanded on demand via the toggle button.
export default function StoryText({ paragraphs, dir, heading, showLabel, hideLabel }) {
  const [open, setOpen] = useState(false);
  if (!paragraphs?.length) return null;

  return (
    <section className="story">
      {heading ? <h2 className="story-heading">{heading}</h2> : null}
      <div className={`book-text ${open ? '' : 'book-text-collapsed'}`} dir={dir}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-outline story-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? hideLabel : showLabel}
      </button>
    </section>
  );
}
