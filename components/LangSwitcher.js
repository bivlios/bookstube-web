'use client';

import { usePathname, useRouter } from 'next/navigation';

const LOCALES = ['he', 'en', 'ar', 'de'];
const LABELS = { he: 'עברית', en: 'English', ar: 'عربي', de: 'Deutsch' };

export default function LangSwitcher({ lang }) {
  const pathname = usePathname();
  const router = useRouter();

  const change = (next) => {
    const parts = pathname.split('/');
    parts[1] = next; // swap the locale segment
    router.push(parts.join('/') || `/${next}`);
  };

  return (
    <select
      className="lang-select"
      value={lang}
      onChange={(e) => change(e.target.value)}
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
